package store

import (
	"testing"
	"time"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
)

func TestBuildCanonicalEvidenceDraftsUsesSourceLinksAsProvenance(t *testing.T) {
	links := []canonicalSourceLink{
		{
			ID:             "source-link-1",
			BatchID:        "batch-1",
			SourceRecordID: "record-1",
			FactTable:      "core.properties",
			FactID:         "fact-1",
		},
		{
			ID:             "source-link-2",
			BatchID:        "batch-1",
			SourceRecordID: "record-2",
			FactTable:      "core.title_registrations",
			FactID:         "fact-2",
		},
	}

	drafts, err := buildCanonicalEvidenceDrafts(
		"prop-1",
		"Erf 412 Rosebank Township",
		"T12345/2024",
		links,
	)
	if err != nil {
		t.Fatalf("build canonical evidence drafts: %v", err)
	}
	if len(drafts) != 2 {
		t.Fatalf("drafts = %d, want 2", len(drafts))
	}
	for i, draft := range drafts {
		if draft.SourceReference != links[i].ID {
			t.Fatalf("draft[%d].source_reference = %q, want source link id %q", i, draft.SourceReference, links[i].ID)
		}
		if draft.ExternalReference != links[i].FactTable {
			t.Fatalf("draft[%d].external_reference = %q, want fact table %q", i, draft.ExternalReference, links[i].FactTable)
		}
		if got := draft.Facts["source_link_id"]; got != links[i].ID {
			t.Fatalf("draft[%d].facts[source_link_id] = %v, want %q", i, got, links[i].ID)
		}
		if got := draft.Facts["linked_property_id"]; got != "prop-1" {
			t.Fatalf("draft[%d].facts[linked_property_id] = %v, want prop-1", i, got)
		}
	}
}

func TestBuildCanonicalEvidenceDraftsRequiresSourceProvenance(t *testing.T) {
	_, err := buildCanonicalEvidenceDrafts("property-1", "Erf 1", "T1/2026", nil)
	if err == nil {
		t.Fatal("expected missing provenance error")
	}
}

func TestCaseDetailWithEvidenceReadinessMarksLinkedConfirmedEvidenceReady(t *testing.T) {
	detail := cases.CaseDetail{
		Case: cases.CaseSummary{
			ID:               "case-1",
			Status:           cases.CaseStatusInReview,
			LinkedPropertyID: "property-1",
		},
		Evidence: []cases.EvidenceItem{
			{
				EvidenceType:   "canonical_property",
				EvidenceStatus: cases.EvidenceStatusConfirmed,
			},
		},
	}

	got := caseDetailWithEvidenceReadiness(detail)

	if got.EvidenceReadiness.State != cases.EvidenceReadinessReadyForDecision {
		t.Fatalf("detail readiness = %s, want %s", got.EvidenceReadiness.State, cases.EvidenceReadinessReadyForDecision)
	}
	if got.Case.EvidenceReadiness.State != cases.EvidenceReadinessReadyForDecision {
		t.Fatalf("case readiness = %s, want %s", got.Case.EvidenceReadiness.State, cases.EvidenceReadinessReadyForDecision)
	}
}

func TestCaseSummaryWithEvidenceReadinessMarksUnmatchedCaseNeedsSourceMatch(t *testing.T) {
	summary := cases.CaseSummary{
		ID:     "case-1",
		Status: cases.CaseStatusOpen,
	}

	got := caseSummaryWithEvidenceReadiness(summary, nil, nil, nil)

	if got.EvidenceReadiness.State != cases.EvidenceReadinessNeedsSourceMatch {
		t.Fatalf("readiness = %s, want %s", got.EvidenceReadiness.State, cases.EvidenceReadinessNeedsSourceMatch)
	}
	if got.EvidenceReadiness.HasLinkedProperty {
		t.Fatal("has linked property = true, want false")
	}
	if got.EvidenceReadiness.EvidenceCount != 0 {
		t.Fatalf("evidence count = %d, want 0", got.EvidenceReadiness.EvidenceCount)
	}
}

func TestAttachPilotContextsAddsPilotMetadataToCaseSummaries(t *testing.T) {
	submittedAt := time.Date(2026, 4, 26, 9, 0, 0, 0, time.UTC)
	summaries := []cases.CaseSummary{
		{ID: "case-1", CaseReference: "TC-1"},
		{ID: "case-2", CaseReference: "TC-2"},
	}
	contexts := map[string]cases.PilotContext{
		"case-2": {
			MatterID:          "matter-2",
			OrganizationID:    "org-1",
			OrganizationName:  "Hama & Associates Inc",
			CustomerReference: "MAT-2",
			CustomerStatus:    "submitted",
			SubmittedAt:       submittedAt,
		},
	}

	attachPilotContexts(summaries, contexts)

	if summaries[0].Pilot != nil {
		t.Fatal("case-1 pilot context present, want nil")
	}
	if summaries[1].Pilot == nil {
		t.Fatal("case-2 pilot context nil, want metadata")
	}
	if summaries[1].Pilot.OrganizationName != "Hama & Associates Inc" {
		t.Fatalf("organization = %q, want Hama & Associates Inc", summaries[1].Pilot.OrganizationName)
	}
}
