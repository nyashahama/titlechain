use sqlx::PgPool;

pub use crate::projection::{PropertySummaryRow, SeedPropertyRow};

pub async fn read_seed_properties(pool: &PgPool) -> sqlx::Result<Vec<SeedPropertyRow>> {
    sqlx::query_as::<_, SeedPropertyRow>(
        "SELECT id, property_description, locality_or_area, municipality_or_deeds_office, title_reference, current_owner_name, status_summary FROM ops.seed_properties",
    )
    .fetch_all(pool)
    .await
}

pub async fn upsert_property_summaries(
    pool: &PgPool,
    summaries: &[PropertySummaryRow],
) -> sqlx::Result<()> {
    let mut tx = pool.begin().await?;

    for summary in summaries {
        sqlx::query(
            r#"INSERT INTO read.property_summaries (
                property_id, property_description, locality_or_area,
                municipality_or_deeds_office, title_reference,
                current_owner_name, status, updated_at
            ) VALUES (
                $1, $2, $3, $4, COALESCE($5, ''), $6, $7, NOW()
            ) ON CONFLICT (property_id) DO UPDATE SET
                property_description = EXCLUDED.property_description,
                locality_or_area = EXCLUDED.locality_or_area,
                municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
                title_reference = EXCLUDED.title_reference,
                current_owner_name = EXCLUDED.current_owner_name,
                status = EXCLUDED.status,
                updated_at = NOW()"#,
        )
        .bind(summary.property_id)
        .bind(&summary.property_description)
        .bind(&summary.locality_or_area)
        .bind(&summary.municipality_or_deeds_office)
        .bind(&summary.title_reference)
        .bind(&summary.current_owner_name)
        .bind(&summary.status)
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;
    Ok(())
}
