use uuid::Uuid;

#[derive(Debug, sqlx::FromRow)]
pub struct SeedPropertyRow {
    pub id: Uuid,
    pub property_description: String,
    pub locality_or_area: String,
    pub municipality_or_deeds_office: String,
    #[sqlx(rename = "title_reference")]
    pub title_ref: Option<String>,
    pub current_owner_name: Option<String>,
    pub status_summary: String,
}

#[derive(Debug)]
pub struct PropertySummaryRow {
    pub property_id: Uuid,
    pub property_description: String,
    pub locality_or_area: String,
    pub municipality_or_deeds_office: String,
    pub title_reference: Option<String>,
    pub current_owner_name: Option<String>,
    pub status: String,
}

pub fn project_seed_property(seed: SeedPropertyRow) -> PropertySummaryRow {
    PropertySummaryRow {
        property_id: seed.id,
        property_description: seed.property_description,
        locality_or_area: seed.locality_or_area,
        municipality_or_deeds_office: seed.municipality_or_deeds_office,
        title_reference: seed.title_ref.map(|v| deeds_normalizer::normalize_title_reference(&v)),
        current_owner_name: seed.current_owner_name,
        status: seed.status_summary,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn project_seed_property_normalizes_title_reference() {
        let projected = project_seed_property(SeedPropertyRow {
            id: Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap(),
            property_description: "Erf 412 Rosebank Township".into(),
            locality_or_area: "Rosebank".into(),
            municipality_or_deeds_office: "Johannesburg".into(),
            title_ref: Some(" t 12345 / 2024 ".into()),
            current_owner_name: Some("Maseko Family Trust".into()),
            status_summary: "No material blocker seeded".into(),
        });
        assert_eq!(projected.title_reference.as_deref(), Some("T 12345 / 2024"));
    }
}