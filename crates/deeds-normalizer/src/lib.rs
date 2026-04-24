pub fn normalize_title_reference(input: &str) -> String {
    input.trim().to_uppercase()
}

pub fn normalize_party_name(input: &str) -> String {
    input
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_uppercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalize_title_reference_trims_and_uppercases() {
        let normalized = normalize_title_reference(" t 123 / 2024 ");
        assert_eq!(normalized, "T 123 / 2024");
    }

    #[test]
    fn normalize_party_name_collapses_whitespace_and_uppercases() {
        let normalized = normalize_party_name("  Maseko   Family  Trust  ");
        assert_eq!(normalized, "MASEKO FAMILY TRUST");
    }
}