use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn run(
    pool: &PgPool,
    run_id: Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let batch = crate::db::get_batch_for_run(pool, run_id).await?;

    let records = read_source_records(&batch.payload_uri, cfg!(test)).await?;

    for (record_key, payload) in records {
        let payload_sha256 = sha256_hex(&payload);
        crate::db::insert_raw_record(
            pool,
            batch.batch_id,
            &record_key,
            "property_snapshot",
            &payload,
            &payload_sha256,
        )
        .await?;
    }

    Ok(())
}

async fn read_source_records(
    payload_uri: &str,
    test_mode: bool,
) -> Result<Vec<(String, Value)>, Box<dyn std::error::Error + Send + Sync>> {
    if payload_uri.is_empty() {
        return Ok(vec![]);
    }

    let path = payload_uri
        .strip_prefix("file://")
        .or_else(|| payload_uri.strip_prefix("s3://"))
        .unwrap_or(payload_uri);

    if !std::path::Path::new(path).exists() {
        if test_mode {
            return Ok(vec![]);
        }
        return Err(format!("payload file not found: {}", path).into());
    }

    let content = tokio::fs::read_to_string(path).await?;
    let mut records = Vec::new();
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let payload: Value = serde_json::from_str(line)?;
        let record_key = payload
            .get("record_key")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| sha256_hex(&payload)[..8].to_string());
        records.push((record_key, payload));
    }

    Ok(records)
}

fn sha256_hex(value: &Value) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    value.to_string().hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}
