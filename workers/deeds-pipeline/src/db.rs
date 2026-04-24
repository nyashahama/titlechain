use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::normalization::StagePropertyRow;
use crate::projection::{PropertySummaryRow, SeedPropertyRow};

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

pub async fn read_seed_properties(pool: &PgPool) -> sqlx::Result<Vec<SeedPropertyRow>> {
    sqlx::query_as::<_, SeedPropertyRow>(
        "SELECT id, property_description, locality_or_area, municipality_or_deeds_office, title_reference, current_owner_name, status_summary FROM ops.seed_properties",
    )
    .fetch_all(pool)
    .await
}

pub async fn upsert_property_summaries(
    pool: &PgPool,
    summaries: &[PropertySummaryRow],
) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    for summary in summaries {
        sqlx::query(
            r#"INSERT INTO read.property_summaries (
                property_id, property_description, locality_or_area,
                municipality_or_deeds_office, title_reference,
                current_owner_name, status, updated_at
            ) VALUES (
                $1, $2, $3, $4, COALESCE($5, ''), $6, $7, NOW()
            ) ON CONFLICT (property_id) DO UPDATE SET
                property_description = EXCLUDED.property_description,
                locality_or_area = EXCLUDED.locality_or_area,
                municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
                title_reference = EXCLUDED.title_reference,
                current_owner_name = EXCLUDED.current_owner_name,
                status = EXCLUDED.status,
                updated_at = NOW()"#,
        )
        .bind(summary.property_id)
        .bind(&summary.property_description)
        .bind(&summary.locality_or_area)
        .bind(&summary.municipality_or_deeds_office)
        .bind(&summary.title_reference)
        .bind(&summary.current_owner_name)
        .bind(&summary.status)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}

#[derive(Debug)]
pub struct QuarantinedRow {
    pub batch_id: Uuid,
    pub source_record_id: Option<Uuid>,
    pub record_key: String,
    pub reason: String,
    pub details: serde_json::Value,
}

pub async fn insert_quarantined_record(pool: &PgPool, row: QuarantinedRow) -> sqlx::Result<()> {
    sqlx::query(
        "INSERT INTO stage.quarantined_records (batch_id, source_record_id, record_key, reason, details) VALUES ($1, $2, $3, $4, $5)",
    )
    .bind(row.batch_id)
    .bind(row.source_record_id)
    .bind(row.record_key)
    .bind(row.reason)
    .bind(row.details)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_run_batch_id(pool: &PgPool, run_id: Uuid) -> sqlx::Result<Uuid> {
    sqlx::query_scalar::<_, Uuid>("SELECT batch_id FROM ops.runs WHERE id = $1")
        .bind(run_id)
        .fetch_one(pool)
        .await
}

pub async fn read_raw_records_for_run(
    pool: &PgPool,
    run_id: Uuid,
) -> sqlx::Result<Vec<pipeline_core::RawRecord>> {
    let rows = sqlx::query(
        r#"SELECT r.record_key, r.record_type, r.payload
           FROM raw.source_records r
           JOIN ops.runs run ON run.batch_id = r.batch_id
           WHERE run.id = $1"#,
    )
    .bind(run_id)
    .fetch_all(pool)
    .await?;

    let mut records = Vec::with_capacity(rows.len());
    for row in rows {
        records.push(pipeline_core::RawRecord {
            record_key: row.try_get("record_key")?,
            record_type: row.try_get("record_type")?,
            payload: row.try_get("payload")?,
        });
    }
    Ok(records)
}

pub async fn insert_stage_property(
    pool: &PgPool,
    batch_id: Uuid,
    row: StagePropertyRow,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO stage.properties (
            batch_id, record_key, municipality_or_deeds_office,
            title_reference, property_description, locality_or_area, current_owner_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)"#,
    )
    .bind(batch_id)
    .bind(row.record_key)
    .bind(row.municipality_or_deeds_office)
    .bind(row.title_reference)
    .bind(row.property_description)
    .bind(row.locality_or_area)
    .bind(row.current_owner_name)
    .execute(pool)
    .await?;
    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
pub struct StagePropertyRecord {
    pub municipality_or_deeds_office: String,
    pub title_reference: Option<String>,
    pub property_description: Option<String>,
    pub locality_or_area: Option<String>,
    pub current_owner_name: Option<String>,
}

pub async fn read_stage_properties(
    pool: &PgPool,
    batch_id: Uuid,
) -> sqlx::Result<Vec<StagePropertyRecord>> {
    sqlx::query_as::<_, StagePropertyRecord>(
        r#"SELECT municipality_or_deeds_office, title_reference, property_description,
                  locality_or_area, current_owner_name
           FROM stage.properties
           WHERE batch_id = $1"#,
    )
    .bind(batch_id)
    .fetch_all(pool)
    .await
}

pub async fn upsert_core_property(
    pool: &PgPool,
    fingerprint: &str,
    row: &StagePropertyRecord,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO core.properties (
            property_fingerprint, municipality_or_deeds_office, title_reference,
            property_description, locality_or_area, current_owner_name
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (property_fingerprint) DO UPDATE SET
            municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
            title_reference = EXCLUDED.title_reference,
            property_description = EXCLUDED.property_description,
            locality_or_area = EXCLUDED.locality_or_area,
            current_owner_name = EXCLUDED.current_owner_name,
            updated_at = NOW()"#,
    )
    .bind(fingerprint)
    .bind(&row.municipality_or_deeds_office)
    .bind(&row.title_reference)
    .bind(&row.property_description)
    .bind(&row.locality_or_area)
    .bind(&row.current_owner_name)
    .execute(pool)
    .await?;
    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct CorePropertyRecord {
    pub id: Uuid,
    pub property_fingerprint: String,
    pub municipality_or_deeds_office: String,
    pub title_reference: Option<String>,
    pub property_description: Option<String>,
    pub locality_or_area: Option<String>,
    pub current_owner_name: Option<String>,
}

pub async fn read_core_properties(pool: &PgPool) -> sqlx::Result<Vec<CorePropertyRecord>> {
    sqlx::query_as::<_, CorePropertyRecord>(
        r#"SELECT id, property_fingerprint, municipality_or_deeds_office, title_reference,
                  property_description, locality_or_area, current_owner_name
           FROM core.properties"#,
    )
    .fetch_all(pool)
    .await
}
