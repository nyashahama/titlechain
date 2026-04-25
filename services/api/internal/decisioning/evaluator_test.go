package decisioning

import (
	"slices"
	"testing"
)

func TestEvaluate_ReviewForQuarantinedSourceRows(t *testing.T) {
	proposal := Evaluate(CaseFacts{
		HasLinkedProperty:        true,
		HasCanonicalTitle:        true,
		HasTitleReference:        true,
		HasQuarantinedSourceRows: true,
		OwnershipAligned:         true,
		SourceCoverageSufficient: true,
	})

	if proposal.Decision != DecisionReview {
		t.Fatalf("decision = %s, want %s", proposal.Decision, DecisionReview)
	}
	if !slices.Contains(proposal.ReasonCodes, "SOURCE_RECORD_QUARANTINED") {
		t.Fatalf("reason_codes = %v, want SOURCE_RECORD_QUARANTINED", proposal.ReasonCodes)
	}
}

func TestEvaluate_StopTakesPrecedence(t *testing.T) {
	proposal := Evaluate(CaseFacts{
		HasActiveInterdict:       true,
		HasConflictingEvidence:   true,
		SourceCoverageSufficient: false,
	})

	if proposal.Decision != DecisionStop {
		t.Fatalf("decision = %s, want %s", proposal.Decision, DecisionStop)
	}
	if !slices.Contains(proposal.ReasonCodes, "ACTIVE_INTERDICT") {
		t.Fatalf("reason_codes = %v, want ACTIVE_INTERDICT", proposal.ReasonCodes)
	}
}

func TestEvaluate_ClearWhenNoStopOrReviewSignals(t *testing.T) {
	proposal := Evaluate(CaseFacts{
		HasLinkedProperty:        true,
		HasCanonicalTitle:        true,
		HasTitleReference:        true,
		OwnershipAligned:         true,
		SourceCoverageSufficient: true,
	})

	if proposal.Decision != DecisionClear {
		t.Fatalf("decision = %s, want %s", proposal.Decision, DecisionClear)
	}
	if len(proposal.ReasonCodes) == 0 {
		t.Fatal("reason_codes = 0, want at least one clear_support code")
	}
}
