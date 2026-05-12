package cases

import "testing"

func TestEvaluateEvidenceReadiness(t *testing.T) {
	tests := []struct {
		name        string
		detail      CaseDetail
		want        EvidenceReadiness
		wantMissing []string
	}{
		{
			name:        "needs source match when no linked property and no confirmed evidence",
			detail:      CaseDetail{Case: CaseSummary{Status: CaseStatusOpen}},
			want:        EvidenceReadinessNeedsSourceMatch,
			wantMissing: []string{"source_match", "confirmed_evidence"},
		},
		{
			name: "needs source match when confirmed evidence has no linked property",
			detail: CaseDetail{
				Case:     CaseSummary{Status: CaseStatusInReview},
				Evidence: []EvidenceItem{{EvidenceStatus: EvidenceStatusConfirmed, EvidenceType: "title_reference"}},
			},
			want:        EvidenceReadinessNeedsSourceMatch,
			wantMissing: []string{"source_match"},
		},
		{
			name: "needs evidence when linked property has no confirmed evidence",
			detail: CaseDetail{
				Case:     CaseSummary{Status: CaseStatusInReview, LinkedPropertyID: "property-1"},
				Evidence: []EvidenceItem{{EvidenceStatus: EvidenceStatusCaptured, EvidenceType: "title_reference"}},
			},
			want: EvidenceReadinessNeedsEvidence,
		},
		{
			name: "has conflict when active conflicting evidence exists",
			detail: CaseDetail{
				Case: CaseSummary{Status: CaseStatusInReview, LinkedPropertyID: "property-1"},
				Evidence: []EvidenceItem{
					{EvidenceStatus: EvidenceStatusConfirmed, EvidenceType: "title_reference"},
					{EvidenceStatus: EvidenceStatusConflicting, EvidenceType: "source_conflict"},
				},
			},
			want: EvidenceReadinessHasConflict,
		},
		{
			name: "ready when confirmed evidence exists without conflicts",
			detail: CaseDetail{
				Case:     CaseSummary{Status: CaseStatusInReview, LinkedPropertyID: "property-1"},
				Evidence: []EvidenceItem{{EvidenceStatus: EvidenceStatusConfirmed, EvidenceType: "title_reference"}},
			},
			want: EvidenceReadinessReadyForDecision,
		},
		{
			name: "exception approved when resolved without confirmed evidence",
			detail: CaseDetail{
				Case:      CaseSummary{Status: CaseStatusResolved},
				Decisions: []Decision{{Decision: DecisionReview, Status: "current", EvidenceException: true, EvidenceExceptionNote: "Source unavailable; partner requested manual review outcome."}},
			},
			want: EvidenceReadinessExceptionApproved,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := EvaluateEvidenceReadiness(tt.detail)
			if got.State != tt.want {
				t.Fatalf("state = %s, want %s", got.State, tt.want)
			}
			if tt.wantMissing != nil {
				if len(got.Missing) != len(tt.wantMissing) {
					t.Fatalf("missing = %v, want %v", got.Missing, tt.wantMissing)
				}
				for i := range tt.wantMissing {
					if got.Missing[i] != tt.wantMissing[i] {
						t.Fatalf("missing = %v, want %v", got.Missing, tt.wantMissing)
					}
				}
			}
		})
	}
}
