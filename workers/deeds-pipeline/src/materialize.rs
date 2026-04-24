use sqlx::PgPool;

pub async fn run(
    pool: &PgPool,
    run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let batch_id = crate::db::get_run_batch_id(pool, run_id).await?;
    let stage_rows = crate::db::read_stage_properties(pool, batch_id).await?;

    for row in &stage_rows {
        let fingerprint = entity_resolution::property_fingerprint(
            &row.municipality_or_deeds_office,
            &row.title_reference,
        );
        crate::db::upsert_core_property(pool, &fingerprint, row).await?;
    }

    Ok(())
}
