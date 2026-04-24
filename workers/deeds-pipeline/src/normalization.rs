use pipeline_core::RawRecord;
use serde_json::Value;

#[derive(Debug)]
pub struct StagePropertyRow {
    pub record_key: String,
    pub municipality_or_deeds_office: String,
    pub property_description: String,
    pub title_reference: String,
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
        .map(deeds_normalizer::normalize_title_reference);

    let Some(municipality) = municipality else {
        return NormalizationResult::Quarantined {
            reason: "Missing municipality_or_deeds_office".into(),
            details: payload.clone(),
        };
    };

    let Some(title_reference) = title_reference else {
        return NormalizationResult::Quarantined {
            reason: "Missing or empty title_reference".into(),
            details: payload.clone(),
        };
    };

    NormalizationResult::Property(StagePropertyRow {
        record_key: record.record_key.clone(),
        municipality_or_deeds_office: municipality.to_string(),
        property_description: payload
            .get("property_description")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_default(),
        title_reference,
    })
}

pub async fn run(
    pool: &sqlx::PgPool,
    run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let batch_id = crate::db::get_run_batch_id(pool, run_id).await?;
    let records = crate::db::read_raw_records_for_run(pool, run_id).await?;

    for (source_record_id, record) in records {
        let result = normalize_record(&record);
        match result {
            NormalizationResult::Property(row) => {
                crate::db::insert_stage_property(pool, batch_id, source_record_id, row).await?;
            }
            NormalizationResult::Quarantined { reason, details } => {
                let quarantined_row = crate::db::QuarantinedRow {
                    batch_id,
                    source_record_id,
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

#[cfg(test)]
mod tests {
    use pipeline_core::RawRecord;
    use crate::normalization::{normalize_record, NormalizationResult};

    #[test]
    fn run_stage_normalization_quarantines_invalid_rows() {
        let row = RawRecord {
            record_key: "row-1".into(),
            record_type: "property_snapshot".into(),
            payload: serde_json::json!({"municipality_or_deeds_office":"Johannesburg"}),
        };

        let result = normalize_record(&row);

        assert!(matches!(result, NormalizationResult::Quarantined { .. }));
    }

    #[test]
    fn normalize_record_success_path() {
        let row = RawRecord {
            record_key: "row-2".into(),
            record_type: "property_snapshot".into(),
            payload: serde_json::json!({
                "municipality_or_deeds_office": "Cape Town",
                "title_reference": "t 12345 / 2024",
                "property_description": "Erf 42 Bellville",
            }),
        };

        let result = normalize_record(&row);

        match result {
            NormalizationResult::Property(stage) => {
                assert_eq!(stage.record_key, "row-2");
                assert_eq!(stage.municipality_or_deeds_office, "Cape Town");
                assert_eq!(stage.property_description, "Erf 42 Bellville");
                assert_eq!(stage.title_reference, "T 12345 / 2024");
            }
            NormalizationResult::Quarantined { .. } => {
                panic!("expected NormalizationResult::Property, got Quarantined");
            }
        }
    }
}
