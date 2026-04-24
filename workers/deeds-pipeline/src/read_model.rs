use sqlx::PgPool;

use crate::projection::PropertySummaryRow;

/// Default status for a property in the read model.
const DEFAULT_PROPERTY_STATUS: &str = "active";

/// Empty placeholder for `locality_or_area` until the field is populated
/// from a more detailed source.
const UNKNOWN_LOCALITY: &str = "";

pub async fn run(
    pool: &PgPool,
    _run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let core_rows = crate::db::read_core_properties(pool).await?;

    let summaries: Vec<PropertySummaryRow> = core_rows
        .into_iter()
        .map(|row| PropertySummaryRow {
            property_id: row.id,
            property_description: row.property_description,
            locality_or_area: UNKNOWN_LOCALITY.into(),
            municipality_or_deeds_office: row.municipality_or_deeds_office,
            title_reference: Some(row.latest_title_reference),
            current_owner_name: None,
            status: DEFAULT_PROPERTY_STATUS.into(),
        })
        .collect();

    crate::db::upsert_property_summaries(pool, &summaries).await?;
    Ok(())
}
