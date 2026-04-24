use sqlx::PgPool;

use crate::projection::PropertySummaryRow;

pub async fn run(
    pool: &PgPool,
    _run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let core_rows = crate::db::read_core_properties(pool).await?;

    let summaries: Vec<PropertySummaryRow> = core_rows
        .into_iter()
        .map(|row| PropertySummaryRow {
            property_id: row.id,
            property_description: row.property_description.unwrap_or_default(),
            locality_or_area: row.locality_or_area.unwrap_or_default(),
            municipality_or_deeds_office: row.municipality_or_deeds_office,
            title_reference: row.title_reference,
            current_owner_name: row.current_owner_name,
            status: "active".into(),
        })
        .collect();

    crate::db::upsert_property_summaries(pool, &summaries).await?;
    Ok(())
}
