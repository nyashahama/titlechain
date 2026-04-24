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

pub async fn mark_job_completed(pool: &PgPool, job_id: Uuid) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    sqlx::query("UPDATE ops.jobs SET status = 'completed', updated_at = NOW() WHERE id = $1")
        .bind(job_id)
        .execute(&mut *tx)
        .await?;

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
        "UPDATE ops.runs SET status = 'failed', finished_at = NOW(), updated_at = NOW() WHERE id = (SELECT run_id FROM ops.jobs WHERE id = $1)",
    )
    .bind(job_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(())
}
