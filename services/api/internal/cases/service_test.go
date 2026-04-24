package cases

import (
	"context"
	"testing"
)

func TestService_CreateCaseAutoAssignsActorAndCreatesAuditEvent(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	req := CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
		TitleReference:            "T12345/2024",
		MatterReference:           "MAT-2026-001",
		IntakeNote:                "Seller file received for pre-lodgement verification.",
	}

	detail, err := svc.CreateCase(ctx, req)
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	if detail.Case.AssigneeID != "ana-001" {
		t.Errorf("assignee_id = %s, want ana-001", detail.Case.AssigneeID)
	}
	if detail.Case.CreatedBy != "ana-001" {
		t.Errorf("created_by = %s, want ana-001", detail.Case.CreatedBy)
	}
	if detail.Case.Status != CaseStatusOpen {
		t.Errorf("status = %s, want open", detail.Case.Status)
	}

	if len(detail.AuditEvents) != 1 {
		t.Fatalf("audit events = %d, want 1", len(detail.AuditEvents))
	}
	if detail.AuditEvents[0].EventType != AuditCaseCreated {
		t.Errorf("audit event type = %s, want %s", detail.AuditEvents[0].EventType, AuditCaseCreated)
	}
}

func TestService_RecordDecisionRejectsStopWithoutHardBlock(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	// Create a case first
	detail, err := svc.CreateCase(ctx, CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Try to record stop with only review_trigger codes
	_, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-001",
		Decision:    DecisionStop,
		ReasonCodes: []string{"OWNERSHIP_CONFLICT"},
		Note:        "Ownership conflict found.",
	})
	if err == nil {
		t.Fatal("expected error for stop without hard_block, got nil")
	}
}

func TestService_RecordDecisionAllowsStopWithHardBlock(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 91 Observatory",
		LocalityOrArea:            "Observatory",
		MunicipalityOrDeedsOffice: "Cape Town",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	detail, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-001",
		Decision:    DecisionStop,
		ReasonCodes: []string{"ACTIVE_INTERDICT"},
		Note:        "Active interdict found against transfer.",
	})
	if err != nil {
		t.Fatalf("record decision: %v", err)
	}

	if detail.Case.Status != CaseStatusResolved {
		t.Errorf("status = %s, want resolved", detail.Case.Status)
	}
	if len(detail.Decisions) != 1 {
		t.Fatalf("decisions = %d, want 1", len(detail.Decisions))
	}
	if detail.Decisions[0].Decision != DecisionStop {
		t.Errorf("decision = %s, want stop", detail.Decisions[0].Decision)
	}
}

func TestService_RecordDecisionRejectsClearWithHardBlock(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Try clear with hard_block code
	_, err = svc.RecordDecision(ctx, detail.Case.ID, RecordDecisionRequest{
		ActorID:     "ana-001",
		Decision:    DecisionClear,
		ReasonCodes: []string{"TITLE_SEARCH_CLEAN", "ACTIVE_INTERDICT"},
		Note:        "Mixed signals.",
	})
	if err == nil {
		t.Fatal("expected error for clear with hard_block, got nil")
	}
}

func TestService_CloseUnresolvedRequiresUnresolvedReasonAndNote(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Farm Portion 17 Rietfontein",
		LocalityOrArea:            "Rietfontein",
		MunicipalityOrDeedsOffice: "Pretoria",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	// Try close without unresolved_information reason code
	_, err = svc.CloseUnresolved(ctx, detail.Case.ID, CloseUnresolvedRequest{
		ActorID:     "ana-001",
		ReasonCodes: []string{"OWNERSHIP_CONFLICT"},
		Note:        "Cannot proceed.",
	})
	if err == nil {
		t.Fatal("expected error for close without unresolved_information code, got nil")
	}

	// Try close without note
	_, err = svc.CloseUnresolved(ctx, detail.Case.ID, CloseUnresolvedRequest{
		ActorID:     "ana-001",
		ReasonCodes: []string{"MISSING_TITLE_REFERENCE"},
		Note:        "",
	})
	if err == nil {
		t.Fatal("expected error for close without note, got nil")
	}

	// Valid close
	detail, err = svc.CloseUnresolved(ctx, detail.Case.ID, CloseUnresolvedRequest{
		ActorID:     "ana-001",
		ReasonCodes: []string{"MISSING_TITLE_REFERENCE", "INSUFFICIENT_SOURCE_COVERAGE"},
		Note:        "Title reference missing and insufficient evidence.",
	})
	if err != nil {
		t.Fatalf("close unresolved: %v", err)
	}

	if detail.Case.Status != CaseStatusClosedUnresolved {
		t.Errorf("status = %s, want closed_unresolved", detail.Case.Status)
	}
}

func TestService_ReassignCaseCreatesAuditEvent(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	ctx := context.Background()

	detail, err := svc.CreateCase(ctx, CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}

	detail, err = svc.ReassignCase(ctx, detail.Case.ID, ReassignCaseRequest{
		ActorID:    "ana-001",
		AssigneeID: "ana-002",
		Note:       "Reassigning to Amina.",
	})
	if err != nil {
		t.Fatalf("reassign case: %v", err)
	}

	if detail.Case.AssigneeID != "ana-002" {
		t.Errorf("assignee_id = %s, want ana-002", detail.Case.AssigneeID)
	}

	found := false
	for _, ev := range detail.AuditEvents {
		if ev.EventType == AuditAssigneeChanged {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected audit event for assignee change")
	}
}

func TestService_CreateCaseFromNormalizedPropertyHydratesCanonicalEvidence(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)

	detail, err := svc.CreateCase(context.Background(), CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
		LinkedPropertyID:          "prop-1",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}
	if detail.Case.LinkedPropertyID != "prop-1" {
		t.Fatalf("linked_property_id = %s, want prop-1", detail.Case.LinkedPropertyID)
	}
	if len(detail.Evidence) == 0 {
		t.Fatal("evidence = 0, want canonical evidence hydrated")
	}
}

func TestService_CreateCaseWithSeedPropertyStartsInReview(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	detail, err := svc.CreateCase(context.Background(), CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
		SeedPropertyID:            "seed-prop-1",
	})
	if err != nil {
		t.Fatalf("create case: %v", err)
	}
	if detail.Case.Status != CaseStatusInReview {
		t.Fatalf("status = %s, want %s", detail.Case.Status, CaseStatusInReview)
	}
	if detail.Case.LinkedSeedPropertyID != "seed-prop-1" {
		t.Fatalf("linked_seed_property_id = %s, want seed-prop-1", detail.Case.LinkedSeedPropertyID)
	}
	found := false
	for _, ev := range detail.AuditEvents {
		if ev.EventType == AuditPropertyMatchConfirmed {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected property_match_confirmed audit event")
	}
	if len(detail.Matches) != 1 {
		t.Fatalf("matches = %d, want 1", len(detail.Matches))
	}
	if detail.Matches[0].MatchSource != "property_selection" {
		t.Errorf("match_source = %s, want property_selection", detail.Matches[0].MatchSource)
	}
	if detail.Matches[0].Status != "confirmed" {
		t.Errorf("match_status = %s, want confirmed", detail.Matches[0].Status)
	}
}
