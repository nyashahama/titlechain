pub fn property_fingerprint(municipality: &str, title_ref: &str) -> String {
    format!("{}::{}", municipality.trim().to_uppercase(), title_ref.trim().to_uppercase())
}
