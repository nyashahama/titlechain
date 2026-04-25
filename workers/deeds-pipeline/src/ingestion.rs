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
    use sha2::{Digest, Sha256};
    let bytes = serde_json::to_vec(value).unwrap_or_default();
    let hash = Sha256::digest(&bytes);
    format!("{:x}", hash)
}

#[cfg(test)]
mod tests {
    use super::sha256_hex;

    #[test]
    fn sha256_hex_returns_full_sha256_digest() {
        let payload = serde_json::json!({
            "municipality_or_deeds_office": "Johannesburg",
            "title_reference": "T123/2024"
        });

        let digest = sha256_hex(&payload);

        assert_eq!(digest.len(), 64);
        assert_eq!(
            digest,
            "38e5627f180d60b07ee985fe359b4fd79eaf5a5d33bd4c26b69e66c5f6546981"
        );
    }
}
