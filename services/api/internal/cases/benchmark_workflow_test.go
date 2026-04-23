package cases

import (
	"context"
	"testing"
)

func TestBenchmarkWorkflow_ClearCase(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, cleanCaseRequest())
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Add evidence
	detail, err = svc.AddEvidence(ctx, detail.Case.ID, AddEvidenceRequest{
		ActorID:         "ana-001",
		EvidenceType:    "title_status",
		SourceType:      "seeded_deeds_record",
		SourceReference: "SEED-DEEDS-001",
		EvidenceStatus:  EvidenceStatusConfirmed,
	})
	if err != nil {
		t.Fatalf("add evidence: %v", err)
	}

	// Record clear decision
	detail, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-001",
		Decision:    DecisionClear,
		ReasonCodes: []string{"TITLE_SEARCH_CLEAN", "OWNERSHIP_CHAIN_CONFIRMED"},
		Note:        "Title search clean and ownership chain confirmed.",
	})
	if err != nil {
		t.Fatalf("record decision: %v", err)
	}

	if detail.Case.Status != CaseStatusResolved {
		t.Errorf("status = %s, want resolved", detail.Case.Status)
	}
	if len(detail.Decisions) != 1 || detail.Decisions[0].Decision != DecisionClear {
		t.Errorf("decision = %v, want clear", detail.Decisions)
	}
	if len(detail.AuditEvents) < 3 {
		t.Errorf("audit events = %d, want >= 3", len(detail.AuditEvents))
	}
}

func TestBenchmarkWorkflow_ReviewCase(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, reviewCaseRequest())
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Add conflicting evidence
	detail, err = svc.AddEvidence(ctx, detail.Case.ID, AddEvidenceRequest{
		ActorID:         "ana-002",
		EvidenceType:    "ownership_check",
		SourceType:      "seeded_deeds_record",
		SourceReference: "SEED-DEEDS-002",
		EvidenceStatus:  EvidenceStatusConfirmed,
	})
	if err != nil {
		t.Fatalf("add evidence: %v", err)
	}

	// Record review decision
	detail, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-002",
		Decision:    DecisionReview,
		ReasonCodes: []string{"OWNERSHIP_CONFLICT", "SOURCE_CONFLICT"},
		Note:        "Ownership conflict between matter file and deeds record.",
	})
	if err != nil {
		t.Fatalf("record decision: %v", err)
	}

	if detail.Case.Status != CaseStatusResolved {
		t.Errorf("status = %s, want resolved", detail.Case.Status)
	}
	if len(detail.Decisions) != 1 || detail.Decisions[0].Decision != DecisionReview {
		t.Errorf("decision = %v, want review", detail.Decisions)
	}
	for _, rc := range detail.Decisions[0].ReasonCodes {
		if rc.Category == ReasonCategoryHardBlock {
			t.Errorf("review decision contains hard_block code: %s", rc.Code)
		}
	}
	if len(detail.AuditEvents) < 3 {
		t.Errorf("audit events = %d, want >= 3", len(detail.AuditEvents))
	}
}

func TestBenchmarkWorkflow_StopCase(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, stopCaseRequest())
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Add evidence showing hard blocker
	detail, err = svc.AddEvidence(ctx, detail.Case.ID, AddEvidenceRequest{
		ActorID:         "ana-003",
		EvidenceType:    "interdict_status",
		SourceType:      "seeded_court_record",
		SourceReference: "SEED-COURT-003",
		EvidenceStatus:  EvidenceStatusConfirmed,
	})
	if err != nil {
		t.Fatalf("add evidence: %v", err)
	}

	// Record stop decision with hard block
	detail, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-003",
		Decision:    DecisionStop,
		ReasonCodes: []string{"ACTIVE_INTERDICT"},
		Note:        "Active interdict prevents transfer.",
	})
	if err != nil {
		t.Fatalf("record decision: %v", err)
	}

	if detail.Case.Status != CaseStatusResolved {
		t.Errorf("status = %s, want resolved", detail.Case.Status)
	}
	if len(detail.Decisions) != 1 || detail.Decisions[0].Decision != DecisionStop {
		t.Errorf("decision = %v, want stop", detail.Decisions)
	}
	var hasHardBlock bool
	for _, rc := range detail.Decisions[0].ReasonCodes {
		if rc.Category == ReasonCategoryHardBlock {
			hasHardBlock = true
		}
	}
	if !hasHardBlock {
		t.Error("stop decision missing hard_block reason code")
	}
	if len(detail.AuditEvents) < 3 {
		t.Errorf("audit events = %d, want >= 3", len(detail.AuditEvents))
	}
}

func TestBenchmarkWorkflow_UnresolvedCase(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, unresolvedCaseRequest())
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Try to add some incomplete evidence
	detail, err = svc.AddEvidence(ctx, detail.Case.ID, AddEvidenceRequest{
		ActorID:         "ana-001",
		EvidenceType:    "title_search",
		SourceType:      "manual_lookup",
		SourceReference: "MANUAL-001",
		EvidenceStatus:  EvidenceStatusCaptured,
	})
	if err != nil {
		t.Fatalf("add evidence: %v", err)
	}

	// Close as unresolved
	detail, err = svc.CloseUnresolved(ctx, detail.Case.ID, CloseUnresolvedRequest{
		ActorID:     "ana-001",
		ReasonCodes: []string{"MISSING_TITLE_REFERENCE", "INSUFFICIENT_SOURCE_COVERAGE"},
		Note:        "Title reference missing and insufficient source coverage to make a defensible decision.",
	})
	if err != nil {
		t.Fatalf("close unresolved: %v", err)
	}

	if detail.Case.Status != CaseStatusClosedUnresolved {
		t.Errorf("status = %s, want closed_unresolved", detail.Case.Status)
	}
	if len(detail.AuditEvents) < 3 {
		t.Errorf("audit events = %d, want >= 3", len(detail.AuditEvents))
	}
}
