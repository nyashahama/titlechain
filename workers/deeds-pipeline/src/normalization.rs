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
pub struct StageTitleRow {
    pub record_key: String,
    pub title_reference: String,
    pub registration_status: String,
    pub effective_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug)]
pub struct StagePartyRow {
    pub record_key: String,
    pub title_reference: String,
    pub party_name: String,
    pub party_role: String,
}

#[derive(Debug)]
pub struct StageEncumbranceRow {
    pub record_key: String,
    pub title_reference: String,
    pub encumbrance_type: String,
    pub status: String,
}

#[derive(Debug)]
pub struct NormalizedRecord {
    pub property: StagePropertyRow,
    pub title: Option<StageTitleRow>,
    pub parties: Vec<StagePartyRow>,
    pub encumbrances: Vec<StageEncumbranceRow>,
}

#[derive(Debug)]
pub enum NormalizationResult {
    Record(NormalizedRecord),
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

    let property = StagePropertyRow {
        record_key: record.record_key.clone(),
        municipality_or_deeds_office: municipality.to_string(),
        property_description: payload
            .get("property_description")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_default(),
        title_reference: title_reference.clone(),
    };

    let title = payload
        .get("registration_status")
        .and_then(|v| v.as_str())
        .map(|status| StageTitleRow {
            record_key: record.record_key.clone(),
            title_reference: title_reference.clone(),
            registration_status: status.to_string(),
            effective_at: payload
                .get("effective_at")
                .and_then(|v| v.as_str())
                .and_then(|s| s.parse::<chrono::DateTime<chrono::Utc>>().ok()),
        });

    let mut parties = Vec::new();
    if let Some(arr) = payload.get("parties").and_then(|v| v.as_array()) {
        for p in arr {
            if let (Some(name), Some(role)) = (
                p.get("party_name").and_then(|v| v.as_str()),
                p.get("party_role").and_then(|v| v.as_str()),
            ) {
                parties.push(StagePartyRow {
                    record_key: record.record_key.clone(),
                    title_reference: title_reference.clone(),
                    party_name: deeds_normalizer::normalize_party_name(name),
                    party_role: role.to_string(),
                });
            }
        }
    }

    let mut encumbrances = Vec::new();
    if let Some(arr) = payload.get("encumbrances").and_then(|v| v.as_array()) {
        for e in arr {
            if let (Some(et), Some(st)) = (
                e.get("encumbrance_type").and_then(|v| v.as_str()),
                e.get("status").and_then(|v| v.as_str()),
            ) {
                encumbrances.push(StageEncumbranceRow {
                    record_key: record.record_key.clone(),
                    title_reference: title_reference.clone(),
                    encumbrance_type: et.to_string(),
                    status: st.to_string(),
                });
            }
        }
    }

    NormalizationResult::Record(NormalizedRecord {
        property,
        title,
        parties,
        encumbrances,
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
            NormalizationResult::Record(norm) => {
                crate::db::insert_stage_property(pool, batch_id, source_record_id, norm.property)
                    .await?;
                if let Some(title) = norm.title {
                    crate::db::insert_stage_title(pool, batch_id, source_record_id, title).await?;
                }
                for party in norm.parties {
                    crate::db::insert_stage_party(pool, batch_id, source_record_id, party).await?;
                }
                for enc in norm.encumbrances {
                    crate::db::insert_stage_encumbrance(pool, batch_id, source_record_id, enc)
                        .await?;
                }
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
    use crate::normalization::{normalize_record, NormalizationResult};
    use pipeline_core::RawRecord;

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
                "registration_status": "registered",
                "parties": [
                    {"party_name": "John  Doe", "party_role": "owner"}
                ],
                "encumbrances": [
                    {"encumbrance_type": "bond", "status": "active"}
                ],
            }),
        };

        let result = normalize_record(&row);

        match result {
            NormalizationResult::Record(norm) => {
                assert_eq!(norm.property.record_key, "row-2");
                assert_eq!(norm.property.municipality_or_deeds_office, "Cape Town");
                assert_eq!(norm.property.property_description, "Erf 42 Bellville");
                assert_eq!(norm.property.title_reference, "T 12345 / 2024");

                assert!(norm.title.is_some());
                let title = norm.title.unwrap();
                assert_eq!(title.registration_status, "registered");

                assert_eq!(norm.parties.len(), 1);
                assert_eq!(norm.parties[0].party_name, "JOHN DOE");
                assert_eq!(norm.parties[0].party_role, "owner");

                assert_eq!(norm.encumbrances.len(), 1);
                assert_eq!(norm.encumbrances[0].encumbrance_type, "bond");
                assert_eq!(norm.encumbrances[0].status, "active");
            }
            NormalizationResult::Quarantined { .. } => {
                panic!("expected NormalizationResult::Record, got Quarantined");
            }
        }
    }

    #[test]
    fn normalize_record_minimal_payload() {
        let row = RawRecord {
            record_key: "row-3".into(),
            record_type: "property_snapshot".into(),
            payload: serde_json::json!({
                "municipality_or_deeds_office": "Johannesburg",
                "title_reference": "t 999 / 2024",
            }),
        };

        let result = normalize_record(&row);

        match result {
            NormalizationResult::Record(norm) => {
                assert_eq!(norm.parties.len(), 0);
                assert_eq!(norm.encumbrances.len(), 0);
                assert!(norm.title.is_none());
            }
            NormalizationResult::Quarantined { .. } => {
                panic!("expected NormalizationResult::Record, got Quarantined");
            }
        }
    }
}
