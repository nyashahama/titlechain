package cases

func EvaluateEvidenceReadiness(detail CaseDetail) EvidenceReadinessSummary {
	summary := EvidenceReadinessSummary{
		EvidenceCount:     len(detail.Evidence),
		HasLinkedProperty: hasLinkedProperty(detail),
	}

	for _, item := range detail.Evidence {
		switch item.EvidenceStatus {
		case EvidenceStatusConfirmed:
			summary.ConfirmedEvidenceCount++
		case EvidenceStatusConflicting:
			summary.HasConflict = true
		}
	}

	switch {
	case detail.Case.Status == CaseStatusResolved && currentDecisionHasEvidenceException(detail.Decisions):
		summary.State = EvidenceReadinessExceptionApproved
	case summary.HasConflict:
		summary.State = EvidenceReadinessHasConflict
	case !summary.HasLinkedProperty:
		summary.State = EvidenceReadinessNeedsSourceMatch
		summary.Missing = []string{"source_match"}
		if summary.ConfirmedEvidenceCount == 0 {
			summary.Missing = append(summary.Missing, "confirmed_evidence")
		}
	case summary.ConfirmedEvidenceCount == 0:
		summary.State = EvidenceReadinessNeedsEvidence
		summary.Missing = []string{"confirmed_evidence"}
	default:
		summary.State = EvidenceReadinessReadyForDecision
	}

	summary.Label, summary.Description = evidenceReadinessCopy(summary.State)
	return summary
}

func hasLinkedProperty(detail CaseDetail) bool {
	if detail.Case.LinkedPropertyID != "" || detail.Case.LinkedSeedPropertyID != "" {
		return true
	}
	for _, match := range detail.Matches {
		if match.Status == "confirmed" {
			return true
		}
	}
	return false
}

func currentDecisionHasEvidenceException(decisions []Decision) bool {
	for _, decision := range decisions {
		if decision.Status == "current" && decision.EvidenceException {
			return true
		}
	}
	return false
}

func evidenceReadinessCopy(state EvidenceReadiness) (string, string) {
	switch state {
	case EvidenceReadinessNeedsSourceMatch:
		return "Needs source match", "Link a property source and confirm supporting evidence before recording a decision."
	case EvidenceReadinessNeedsEvidence:
		return "Needs evidence", "Confirm at least one evidence item before recording a decision."
	case EvidenceReadinessHasConflict:
		return "Has conflict", "Resolve conflicting evidence before recording a decision."
	case EvidenceReadinessReadyForDecision:
		return "Ready for decision", "Confirmed evidence is available and no active conflict is present."
	case EvidenceReadinessExceptionApproved:
		return "Exception approved", "The resolved current decision includes an approved evidence exception."
	default:
		return "Unknown", "Evidence readiness could not be evaluated."
	}
}
