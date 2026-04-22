pub fn normalize_title_reference(input: &str) -> String {
    input.trim().to_uppercase()
}

#[cfg(test)]
mod tests {
    use super::normalize_title_reference;

    #[test]
    fn normalize_title_reference_trims_and_uppercases() {
        let normalized = normalize_title_reference(" t 123 / 2024 ");
        assert_eq!(normalized, "T 123 / 2024");
    }
}
