package decisioning

func buildExplanation(summary string, reasonCodes []string, facts CaseFacts) map[string]any {
	reasons := make([]map[string]any, 0, len(reasonCodes))
	for _, code := range reasonCodes {
		reasons = append(reasons, map[string]any{
			"code":    code,
			"message": reasonMessage(code),
		})
	}

	return map[string]any{
		"summary": summary,
		"reasons": reasons,
		"facts": map[string]any{
			"has_linked_property":          facts.HasLinkedProperty,
			"has_canonical_title":          facts.HasCanonicalTitle,
			"has_title_reference":          facts.HasTitleReference,
			"has_title_reference_mismatch": facts.HasTitleReferenceMismatch,
			"has_active_interdict":         facts.HasActiveInterdict,
			"has_active_encumbrance":       facts.HasActiveEncumbrance,
			"has_quarantined_source_rows":  facts.HasQuarantinedSourceRows,
			"ownership_aligned":            facts.OwnershipAligned,
			"source_coverage_sufficient":   facts.SourceCoverageSufficient,
			"has_party_variance":           facts.HasPartyVariance,
			"has_conflicting_evidence":     facts.HasConflictingEvidence,
			"has_fraud_signal":             facts.HasFraudSignal,
		},
	}
}

func reasonMessage(code string) string {
	switch code {
	case "ACTIVE_INTERDICT":
		return "Canonical title state shows an active interdict."
	case "TITLE_DEED_MISMATCH":
		return "Supplied title reference conflicts with canonical title."
	case "REGISTERED_BOND_CONFLICT":
		return "Canonical encumbrance state blocks transfer."
	case "OWNERSHIP_CONFLICT":
		return "Case parties do not align with canonical ownership."
	case "PARTY_NAME_VARIANCE":
		return "Party identity variance requires analyst review."
	case "SOURCE_CONFLICT":
		return "Conflicting source evidence requires review."
	case "FRAUD_SIGNAL_PRESENT":
		return "Fraud or anomaly signal requires analyst review."
	case "MISSING_TITLE_REFERENCE":
		return "Title reference is missing from the case."
	case "INSUFFICIENT_SOURCE_COVERAGE":
		return "Normalized source coverage is insufficient for a clear decision."
	case "SOURCE_RECORD_QUARANTINED":
		return "A linked normalized source row is quarantined."
	case "TITLE_SEARCH_CLEAN":
		return "Canonical title state supports a clean transfer."
	case "ENCUMBRANCE_CHECK_CLEAN":
		return "No active canonical encumbrance blocks transfer."
	case "OWNERSHIP_CHAIN_CONFIRMED":
		return "Canonical ownership aligns with current case context."
	default:
		return "Reason triggered by deterministic decision rules."
	}
}
