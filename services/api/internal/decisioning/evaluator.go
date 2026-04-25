package decisioning

import (
	"slices"
)

func Evaluate(f CaseFacts) Proposal {
	stopReasons := make([]string, 0, 3)
	if f.HasActiveInterdict {
		stopReasons = append(stopReasons, "ACTIVE_INTERDICT")
	}
	if f.HasTitleReferenceMismatch {
		stopReasons = append(stopReasons, "TITLE_DEED_MISMATCH")
	}
	if f.HasActiveEncumbrance {
		stopReasons = append(stopReasons, "REGISTERED_BOND_CONFLICT")
	}
	if len(stopReasons) > 0 {
		return newProposal(
			DecisionStop,
			stopReasons,
			"Canonical hard-block signals prevent a clear transfer outcome.",
			f,
		)
	}

	reviewReasons := make([]string, 0, 7)
	if !f.OwnershipAligned {
		reviewReasons = append(reviewReasons, "OWNERSHIP_CONFLICT")
	}
	if f.HasPartyVariance {
		reviewReasons = append(reviewReasons, "PARTY_NAME_VARIANCE")
	}
	if f.HasConflictingEvidence {
		reviewReasons = append(reviewReasons, "SOURCE_CONFLICT")
	}
	if f.HasFraudSignal {
		reviewReasons = append(reviewReasons, "FRAUD_SIGNAL_PRESENT")
	}
	if !f.HasTitleReference {
		reviewReasons = append(reviewReasons, "MISSING_TITLE_REFERENCE")
	}
	if !f.SourceCoverageSufficient {
		reviewReasons = append(reviewReasons, "INSUFFICIENT_SOURCE_COVERAGE")
	}
	if f.HasQuarantinedSourceRows {
		reviewReasons = append(reviewReasons, "SOURCE_RECORD_QUARANTINED")
	}
	if len(reviewReasons) > 0 {
		return newProposal(
			DecisionReview,
			reviewReasons,
			"Normalized source coverage is incomplete, conflicting, or requires analyst review.",
			f,
		)
	}

	clearReasons := make([]string, 0, 3)
	if f.HasCanonicalTitle && f.HasTitleReference && !f.HasTitleReferenceMismatch {
		clearReasons = append(clearReasons, "TITLE_SEARCH_CLEAN")
	}
	if !f.HasActiveEncumbrance {
		clearReasons = append(clearReasons, "ENCUMBRANCE_CHECK_CLEAN")
	}
	if f.OwnershipAligned {
		clearReasons = append(clearReasons, "OWNERSHIP_CHAIN_CONFIRMED")
	}
	if len(clearReasons) == 0 {
		clearReasons = append(clearReasons, "INSUFFICIENT_SOURCE_COVERAGE")
		return newProposal(
			DecisionReview,
			clearReasons,
			"Evidence is insufficient for an automated clear outcome.",
			f,
		)
	}

	return newProposal(
		DecisionClear,
		clearReasons,
		"Normalized evidence supports a clean transfer outcome.",
		f,
	)
}

func newProposal(decision DecisionOutcome, reasonCodes []string, summary string, facts CaseFacts) Proposal {
	deduped := make([]string, 0, len(reasonCodes))
	for _, code := range reasonCodes {
		if code == "" || slices.Contains(deduped, code) {
			continue
		}
		deduped = append(deduped, code)
	}

	return Proposal{
		EngineVersion: EngineVersion,
		Decision:      decision,
		Summary:       summary,
		ReasonCodes:   deduped,
		Explanation:   buildExplanation(summary, deduped, facts),
	}
}
