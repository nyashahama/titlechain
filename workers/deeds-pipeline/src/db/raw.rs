use serde_json::Value;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use pipeline_core::RawRecord;

#[derive(Debug, sqlx::FromRow)]
pub struct BatchRecord {
    pub batch_id: Uuid,
    pub payload_uri: String,
}

pub async fn get_batch_for_run(pool: &PgPool, run_id: Uuid) -> sqlx::Result<BatchRecord> {
    sqlx::query_as::<_, BatchRecord>(
        r#"SELECT b.id as batch_id, COALESCE(b.payload_uri, '') as payload_uri
           FROM raw.batches b
           JOIN ops.runs run ON run.batch_id = b.id
           WHERE run.id = $1"#,
    )
    .bind(run_id)
    .fetch_one(pool)
    .await
}

pub async fn insert_raw_record(
    pool: &PgPool,
    batch_id: Uuid,
    record_key: &str,
    record_type: &str,
    payload: &Value,
    payload_sha256: &str,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO raw.records
           (batch_id, record_key, record_type, payload, payload_sha256)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (batch_id, record_key) DO NOTHING"#,
    )
    .bind(batch_id)
    .bind(record_key)
    .bind(record_type)
    .bind(payload)
    .bind(payload_sha256)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn read_raw_records_for_run(
    pool: &PgPool,
    run_id: Uuid,
) -> sqlx::Result<Vec<(Uuid, RawRecord)>> {
    let rows = sqlx::query(
        r#"SELECT r.id, r.record_key, r.record_type, r.payload
           FROM raw.records r
           JOIN ops.runs run ON run.batch_id = r.batch_id
           WHERE run.id = $1"#,
    )
    .bind(run_id)
    .fetch_all(pool)
    .await?;

    let mut records = Vec::with_capacity(rows.len());
    for row in rows {
        records.push((
            row.try_get("id")?,
            RawRecord {
                record_key: row.try_get("record_key")?,
                record_type: row.try_get("record_type")?,
                payload: row.try_get("payload")?,
            },
        ));
    }
    Ok(records)
}
