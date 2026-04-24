use sqlx::PgPool;

use crate::config::Config;
use crate::db;
use crate::ingestion;
use crate::materialize;
use crate::normalization;
use crate::projection;
use crate::read_model;

pub async fn run(
    pool: PgPool,
    config: Config,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let worker_id = "deeds-pipeline".to_string();
    loop {
        match db::claim_next_job(&pool, &worker_id).await? {
            Some(job) => {
                db::mark_job_running(&pool, job.id).await?;
                db::begin_job_attempt(&pool, job.id, &worker_id).await?;
                let result = match job.job_kind.as_str() {
                    "raw_landing" => ingestion::run(&pool, job.run_id).await,
                    "stage_normalization" => normalization::run(&pool, job.run_id).await,
                    "core_materialization" => materialize::run(&pool, job.run_id).await,
                    "read_refresh" => read_model::run(&pool, job.run_id).await,
                    "seed_property_projection" => run_seed_projection(&pool).await,
                    other => Err(format!("unsupported job kind: {other}").into()),
                };
                match result {
                    Ok(()) => db::mark_job_completed(&pool, job.id).await?,
                    Err(e) => {
                        db::mark_job_failed(&pool, job.id, &e.to_string()).await?;
                    }
                }
            }
            None => tokio::time::sleep(config.poll_interval).await,
        }
    }
}

async fn run_seed_projection(
    pool: &PgPool,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let seeds = db::read_seed_properties(pool).await?;
    let summaries: Vec<_> = seeds
        .into_iter()
        .map(projection::project_seed_property)
        .collect();
    db::upsert_property_summaries(pool, &summaries).await?;
    Ok(())
}
