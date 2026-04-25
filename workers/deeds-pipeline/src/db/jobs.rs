use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct ClaimedJob {
    pub id: Uuid,
    pub run_id: Uuid,
    pub job_kind: String,
}

pub async fn claim_next_job(pool: &PgPool, worker_id: &str) -> sqlx::Result<Option<ClaimedJob>> {
    sqlx::query_as::<_, ClaimedJob>(
        r#"WITH candidate AS (
            SELECT id
            FROM ops.jobs
            WHERE status = 'pending'
            ORDER BY created_at
            FOR UPDATE SKIP LOCKED
            LIMIT 1
        )
        UPDATE ops.jobs
        SET status = 'leased',
            lease_owner = $1,
            lease_expires_at = NOW() + INTERVAL '5 minutes',
            updated_at = NOW()
        WHERE id = (SELECT id FROM candidate)
        RETURNING id, run_id, job_kind"#,
    )
    .bind(worker_id)
    .fetch_optional(pool)
    .await
}

pub async fn begin_job_attempt(pool: &PgPool, job_id: Uuid, worker_id: &str) -> sqlx::Result<()> {
    sqlx::query(
        "INSERT INTO ops.job_attempts (job_id, attempt_number, worker_id, outcome) VALUES ($1, COALESCE((SELECT MAX(attempt_number) + 1 FROM ops.job_attempts WHERE job_id = $1), 1), $2, 'running')",
    )
    .bind(job_id)
    .bind(worker_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn mark_job_running(pool: &PgPool, job_id: Uuid) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query("UPDATE ops.jobs SET status = 'running', updated_at = NOW() WHERE id = $1")
        .bind(job_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "UPDATE ops.runs SET status = 'running', started_at = NOW(), updated_at = NOW() WHERE id = (SELECT run_id FROM ops.jobs WHERE id = $1)",
    )
    .bind(job_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}

const INGESTION_SEQUENCE: &[&str] = &[
    "raw_landing",
    "stage_normalization",
    "core_materialization",
    "read_refresh",
];

pub async fn mark_job_completed(pool: &PgPool, job_id: Uuid) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query("UPDATE ops.jobs SET status = 'completed', updated_at = NOW() WHERE id = $1")
        .bind(job_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query(
        "UPDATE ops.job_attempts SET outcome = 'completed', finished_at = NOW() WHERE job_id = $1 AND outcome = 'running'",
    )
    .bind(job_id)
    .execute(&mut *tx)
    .await?;

    // Unblock the next stage in the ingestion sequence
    let run_id: Uuid = sqlx::query_scalar("SELECT run_id FROM ops.jobs WHERE id = $1")
        .bind(job_id)
        .fetch_one(&mut *tx)
        .await?;

    let job_kind: String = sqlx::query_scalar("SELECT job_kind FROM ops.jobs WHERE id = $1")
        .bind(job_id)
        .fetch_one(&mut *tx)
        .await?;

    if let Some(pos) = INGESTION_SEQUENCE.iter().position(|&k| k == job_kind) {
        if let Some(&next_kind) = INGESTION_SEQUENCE.get(pos + 1) {
            sqlx::query(
                "UPDATE ops.jobs SET status = 'pending', updated_at = NOW() WHERE run_id = $1 AND job_kind = $2 AND status = 'blocked'",
            )
            .bind(run_id)
            .bind(next_kind)
            .execute(&mut *tx)
            .await?;
        }
    }

    sqlx::query(
        r#"UPDATE ops.runs
        SET status = 'completed', finished_at = NOW(), updated_at = NOW()
        WHERE id = (SELECT run_id FROM ops.jobs WHERE id = $1)
          AND NOT EXISTS (
            SELECT 1 FROM ops.jobs j
            WHERE j.run_id = (SELECT run_id FROM ops.jobs WHERE id = $1)
            AND j.status != 'completed'
          )"#,
    )
    .bind(job_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}

pub async fn mark_job_failed(pool: &PgPool, job_id: Uuid, error_message: &str) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query(
        "UPDATE ops.jobs SET status = 'failed', error_message = $2, updated_at = NOW() WHERE id = $1",
    )
    .bind(job_id)
    .bind(error_message)
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        "UPDATE ops.job_attempts SET outcome = 'failed', finished_at = NOW(), error_message = $2 WHERE job_id = $1 AND outcome = 'running'",
    )
    .bind(job_id)
    .bind(error_message)
    .execute(&mut *tx)
    .await?;

    sqlx::query(
        "UPDATE ops.runs SET status = 'failed', finished_at = NOW(), updated_at = NOW() WHERE id = (SELECT run_id FROM ops.jobs WHERE id = $1)",
    )
    .bind(job_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn begin_job_attempt_signature_is_valid() {
        // Compile-time check that the function exists with the expected signature
        fn _check<'a>(
            pool: &'a sqlx::PgPool,
            job_id: Uuid,
            worker_id: &'a str,
        ) -> impl std::future::Future<Output = sqlx::Result<()>> + use<'a> {
            begin_job_attempt(pool, job_id, worker_id)
        }
    }
}
