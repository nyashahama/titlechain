use sqlx::PgPool;
use uuid::Uuid;

use crate::db::stage::StagePropertyRecord;

pub async fn upsert_core_property(
    pool: &PgPool,
    fingerprint: &str,
    row: &StagePropertyRecord,
) -> sqlx::Result<Uuid> {
    let rec = sqlx::query_as::<_, CoreFactId>(
        r#"INSERT INTO core.properties (
            property_fingerprint, municipality_or_deeds_office, property_description,
            latest_title_reference
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (property_fingerprint) DO UPDATE SET
            municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
            property_description = EXCLUDED.property_description,
            latest_title_reference = EXCLUDED.latest_title_reference,
            updated_at = NOW()
        RETURNING id"#,
    )
    .bind(fingerprint)
    .bind(&row.municipality_or_deeds_office)
    .bind(&row.property_description)
    .bind(&row.title_reference)
    .fetch_one(pool)
    .await?;
    Ok(rec.id)
}

#[derive(Debug, sqlx::FromRow)]
pub struct CoreFactId {
    pub id: Uuid,
}

pub async fn insert_core_title_registration(
    pool: &PgPool,
    property_id: Uuid,
    title_reference: &str,
    registration_status: &str,
    effective_at: Option<chrono::DateTime<chrono::Utc>>,
) -> sqlx::Result<Uuid> {
    let rec = sqlx::query_as::<_, CoreFactId>(
        r#"INSERT INTO core.title_registrations (
            property_id, title_reference, registration_status, effective_at
        ) VALUES ($1, $2, $3, $4)
        RETURNING id"#,
    )
    .bind(property_id)
    .bind(title_reference)
    .bind(registration_status)
    .bind(effective_at)
    .fetch_one(pool)
    .await?;
    Ok(rec.id)
}

pub async fn insert_core_property_party(
    pool: &PgPool,
    property_id: Uuid,
    party_name: &str,
    party_role: &str,
) -> sqlx::Result<Uuid> {
    let rec = sqlx::query_as::<_, CoreFactId>(
        r#"INSERT INTO core.property_parties (
            property_id, party_name, party_role
        ) VALUES ($1, $2, $3)
        RETURNING id"#,
    )
    .bind(property_id)
    .bind(party_name)
    .bind(party_role)
    .fetch_one(pool)
    .await?;
    Ok(rec.id)
}

pub async fn insert_core_encumbrance(
    pool: &PgPool,
    property_id: Uuid,
    encumbrance_type: &str,
    status: &str,
) -> sqlx::Result<Uuid> {
    let rec = sqlx::query_as::<_, CoreFactId>(
        r#"INSERT INTO core.encumbrances (
            property_id, encumbrance_type, status
        ) VALUES ($1, $2, $3)
        RETURNING id"#,
    )
    .bind(property_id)
    .bind(encumbrance_type)
    .bind(status)
    .fetch_one(pool)
    .await?;
    Ok(rec.id)
}

pub async fn insert_core_source_link(
    pool: &PgPool,
    property_id: Uuid,
    batch_id: Uuid,
    source_record_id: Uuid,
    fact_table: &str,
    fact_id: Uuid,
) -> sqlx::Result<()> {
    sqlx::query(
        r#"INSERT INTO core.source_links (
            property_id, batch_id, source_record_id, fact_table, fact_id
        ) VALUES ($1, $2, $3, $4, $5)"#,
    )
    .bind(property_id)
    .bind(batch_id)
    .bind(source_record_id)
    .bind(fact_table)
    .bind(fact_id)
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

#[derive(Debug, sqlx::FromRow)]
#[allow(dead_code)]
pub struct CorePropertyWithOwners {
    pub id: Uuid,
    pub property_fingerprint: String,
    pub municipality_or_deeds_office: String,
    pub property_description: String,
    pub latest_title_reference: String,
    pub owner_name: Option<String>,
    pub encumbrance_status: Option<String>,
}

pub async fn read_core_properties_with_owners(
    pool: &PgPool,
) -> sqlx::Result<Vec<CorePropertyWithOwners>> {
    sqlx::query_as::<_, CorePropertyWithOwners>(
        r#"SELECT
            p.id,
            p.property_fingerprint,
            p.municipality_or_deeds_office,
            p.property_description,
            p.latest_title_reference,
            (SELECT party_name FROM core.property_parties
             WHERE property_id = p.id AND party_role = 'owner'
             LIMIT 1) AS owner_name,
            (SELECT status FROM core.encumbrances
             WHERE property_id = p.id
             LIMIT 1) AS encumbrance_status
        FROM core.properties p"#,
    )
    .fetch_all(pool)
    .await
}
