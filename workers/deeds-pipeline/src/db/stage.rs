use sqlx::PgPool;
use uuid::Uuid;

use crate::normalization::StagePropertyRow;

#[derive(Debug)]
pub struct QuarantinedRow {
    pub batch_id: Uuid,
    pub source_record_id: Uuid,
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

pub async fn insert_stage_property(
    pool: &PgPool,
    batch_id: Uuid,
    source_record_id: Uuid,
    row: StagePropertyRow,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO stage.property_rows (
            batch_id, source_record_id, record_key, municipality_or_deeds_office,
            property_description, title_reference
        ) VALUES ($1, $2, $3, $4, $5, $6)"#,
    )
    .bind(batch_id)
    .bind(source_record_id)
    .bind(row.record_key)
    .bind(row.municipality_or_deeds_office)
    .bind(row.property_description)
    .bind(row.title_reference)
    .execute(pool)
    .await?;
    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
pub struct StagePropertyRecord {
    pub municipality_or_deeds_office: String,
    pub property_description: String,
    pub title_reference: String,
}

pub async fn read_stage_properties(
    pool: &PgPool,
    batch_id: Uuid,
) -> sqlx::Result<Vec<StagePropertyRecord>> {
    sqlx::query_as::<_, StagePropertyRecord>(
        r#"SELECT municipality_or_deeds_office, property_description, title_reference
           FROM stage.property_rows
           WHERE batch_id = $1"#,
    )
    .bind(batch_id)
    .fetch_all(pool)
    .await
}
