use sqlx::{PgPool, Row};
use uuid::Uuid;

use pipeline_core::RawRecord;

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
