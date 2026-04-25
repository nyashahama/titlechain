use deeds_normalizer::normalize_title_reference;

pub fn property_fingerprint(municipality: &str, title_ref: &str) -> String {
    format!(
        "{}::{}",
        municipality.trim().to_uppercase(),
        normalize_title_reference(title_ref)
    )
}

#[cfg(test)]
mod tests {
    use super::property_fingerprint;

    #[test]
    fn property_fingerprint_is_deterministic() {
        let fp = property_fingerprint("  Johannesburg  ", " t 123 / 2024 ");
        assert_eq!(fp, "JOHANNESBURG::T 123 / 2024");
    }
}
