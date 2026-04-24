use pipeline_core::RawRecord;
use serde_json::Value;

#[derive(Debug)]
pub struct StagePropertyRow {
    pub record_key: String,
    pub municipality_or_deeds_office: String,
    pub title_reference: Option<String>,
    pub property_description: Option<String>,
    pub locality_or_area: Option<String>,
    pub current_owner_name: Option<String>,
}

#[derive(Debug)]
pub enum NormalizationResult {
    Property(StagePropertyRow),
    Quarantined { reason: String, details: Value },
}

pub fn normalize_record(record: &RawRecord) -> NormalizationResult {
    let payload = &record.payload;

    let municipality = payload
        .get("municipality_or_deeds_office")
        .and_then(|v| v.as_str())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty());

    let title_reference = payload
        .get("title_reference")
        .and_then(|v| v.as_str())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| deeds_normalizer::normalize_title_reference(s));

    if municipality.is_none() {
        return NormalizationResult::Quarantined {
            reason: "Missing municipality_or_deeds_office".into(),
            details: payload.clone(),
        };
    }

    if title_reference.is_none() {
        return NormalizationResult::Quarantined {
            reason: "Missing or empty title_reference".into(),
            details: payload.clone(),
        };
    }

    NormalizationResult::Property(StagePropertyRow {
        record_key: record.record_key.clone(),
        municipality_or_deeds_office: municipality.unwrap().to_string(),
        title_reference,
        property_description: payload
            .get("property_description")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        locality_or_area: payload
            .get("locality_or_area")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        current_owner_name: payload
            .get("current_owner_name")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
    })
}

pub async fn run(
    pool: &sqlx::PgPool,
    run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let batch_id = crate::db::get_run_batch_id(pool, run_id).await?;
    let records = crate::db::read_raw_records_for_run(pool, run_id).await?;

    for record in records {
        let result = normalize_record(&record);
        match result {
            NormalizationResult::Property(row) => {
                crate::db::insert_stage_property(pool, batch_id, row).await?;
            }
            NormalizationResult::Quarantined { reason, details } => {
                let quarantined_row = crate::db::QuarantinedRow {
                    batch_id,
                    source_record_id: None,
                    record_key: record.record_key,
                    reason,
                    details,
                };
                crate::db::insert_quarantined_record(pool, quarantined_row).await?;
            }
        }
    }

    Ok(())
}
