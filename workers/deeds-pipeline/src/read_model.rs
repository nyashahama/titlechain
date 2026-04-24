use sqlx::PgPool;
use uuid::Uuid;

use crate::projection::PropertySummaryRow;

/// Default status for a property when no encumbrance is found.
const DEFAULT_PROPERTY_STATUS: &str = "normal";

/// Empty placeholder for `locality_or_area` until the field is populated
/// from a more detailed source.
const UNKNOWN_LOCALITY: &str = "";

pub async fn run(
    pool: &PgPool,
    run_id: Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Read all core properties with owner and encumbrance info
    let core_rows = crate::db::read_core_properties_with_owners(pool).await?;

    let summaries: Vec<PropertySummaryRow> = core_rows
        .into_iter()
        .map(|row| PropertySummaryRow {
            property_id: row.id,
            property_description: row.property_description,
            locality_or_area: UNKNOWN_LOCALITY.into(),
            municipality_or_deeds_office: row.municipality_or_deeds_office,
            title_reference: Some(row.latest_title_reference),
            current_owner_name: row.owner_name,
            status: row.encumbrance_status.unwrap_or_else(|| DEFAULT_PROPERTY_STATUS.into()),
        })
        .collect();

    crate::db::upsert_property_summaries(pool, &summaries).await?;
    Ok(())
}
