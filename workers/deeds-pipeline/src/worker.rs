use sqlx::PgPool;

use crate::config::Config;
use crate::db;
use crate::projection;

pub async fn run(
    pool: PgPool,
    config: Config,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let worker_id = "deeds-pipeline".to_string();
    loop {
        match db::claim_next_job(&pool, &worker_id).await? {
            Some(job) => {
                db::mark_job_running(&pool, job.id).await?;
                match run_seed_projection(&pool).await {
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
