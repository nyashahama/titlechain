use sqlx::PgPool;
use uuid::Uuid;

use crate::db::stage::StagePropertyRecord;

pub async fn upsert_core_property(
    pool: &PgPool,
    fingerprint: &str,
    row: &StagePropertyRecord,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO core.properties (
            property_fingerprint, municipality_or_deeds_office, property_description,
            latest_title_reference
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (property_fingerprint) DO UPDATE SET
            municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
            property_description = EXCLUDED.property_description,
            latest_title_reference = EXCLUDED.latest_title_reference,
            updated_at = NOW()"#,
    )
    .bind(fingerprint)
    .bind(&row.municipality_or_deeds_office)
    .bind(&row.property_description)
    .bind(&row.title_reference)
    .execute(pool)
    .await?;
    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct CorePropertyRecord {
    pub id: Uuid,
    pub property_fingerprint: String,
    pub municipality_or_deeds_office: String,
    pub property_description: String,
    pub latest_title_reference: String,
}

pub async fn read_core_properties(pool: &PgPool) -> sqlx::Result<Vec<CorePropertyRecord>> {
    sqlx::query_as::<_, CorePropertyRecord>(
        r#"SELECT id, property_fingerprint, municipality_or_deeds_office, property_description,
                  latest_title_reference
           FROM core.properties"#,
    )
    .fetch_all(pool)
    .await
}
