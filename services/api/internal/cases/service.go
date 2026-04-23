package cases

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

const (
	AuditCaseCreated            = "case_created"
	AuditPropertyMatchConfirmed = "property_match_confirmed"
	AuditPropertyMatchRejected  = "property_match_rejected"
	AuditAssigneeChanged        = "assignee_changed"
	AuditEvidenceAdded          = "evidence_added"
	AuditPartyAdded             = "party_added"
	AuditDecisionRecorded       = "decision_recorded"
	AuditCaseClosedUnresolved   = "case_closed_unresolved"
	AuditCaseReopened           = "case_reopened"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return Service{repo: repo}
}

func (s Service) ListAnalysts(ctx context.Context) ([]Analyst, error) {
	return s.repo.ListAnalysts(ctx)
}

func (s Service) ListReasonCodes(ctx context.Context) ([]ReasonCode, error) {
	return s.repo.ListReasonCodes(ctx)
}

func (s Service) CreateCase(ctx context.Context, req CreateCaseRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if strings.TrimSpace(req.PropertyDescription) == "" {
		return CaseDetail{}, errors.New("property_description is required")
	}
	if strings.TrimSpace(req.LocalityOrArea) == "" {
		return CaseDetail{}, errors.New("locality_or_area is required")
	}
	if strings.TrimSpace(req.MunicipalityOrDeedsOffice) == "" {
		return CaseDetail{}, errors.New("municipality_or_deeds_office is required")
	}

	caseRef := generateCaseReference()
	return s.repo.CreateCaseWorkflow(ctx, req, caseRef)
}

func (s Service) ListCases(ctx context.Context, filter ListCasesFilter) ([]CaseSummary, error) {
	return s.repo.ListCases(ctx, filter)
}

func (s Service) GetCaseDetail(ctx context.Context, caseID string) (CaseDetail, error) {
	return s.repo.GetCaseDetail(ctx, caseID)
}

func (s Service) ConfirmPropertyMatch(ctx context.Context, caseID string, req ConfirmPropertyMatchRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if strings.TrimSpace(req.MatchID) == "" {
		return CaseDetail{}, errors.New("match_id is required")
	}
	if req.Action != "confirm" && req.Action != "reject" {
		return CaseDetail{}, errors.New("action must be confirm or reject")
	}
	return s.repo.ConfirmPropertyMatchWorkflow(ctx, caseID, req)
}

func (s Service) AddEvidence(ctx context.Context, caseID string, req AddEvidenceRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if strings.TrimSpace(req.EvidenceType) == "" {
		return CaseDetail{}, errors.New("evidence_type is required")
	}
	if strings.TrimSpace(req.SourceType) == "" {
		return CaseDetail{}, errors.New("source_type is required")
	}
	if strings.TrimSpace(req.SourceReference) == "" {
		return CaseDetail{}, errors.New("source_reference is required")
	}
	switch req.EvidenceStatus {
	case EvidenceStatusCaptured, EvidenceStatusConfirmed, EvidenceStatusConflicting, EvidenceStatusSuperseded:
		// valid
	default:
		return CaseDetail{}, errors.New("invalid evidence_status")
	}
	return s.repo.AddEvidenceWorkflow(ctx, caseID, req)
}

func (s Service) AddParty(ctx context.Context, caseID string, req AddPartyRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if strings.TrimSpace(req.DisplayName) == "" {
		return CaseDetail{}, errors.New("display_name is required")
	}
	if strings.TrimSpace(req.Role) == "" {
		return CaseDetail{}, errors.New("role is required")
	}
	if strings.TrimSpace(req.EntityType) == "" {
		return CaseDetail{}, errors.New("entity_type is required")
	}
	return s.repo.AddPartyWorkflow(ctx, caseID, req)
}

func (s Service) ReassignCase(ctx context.Context, caseID string, req ReassignCaseRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if strings.TrimSpace(req.AssigneeID) == "" {
		return CaseDetail{}, errors.New("assignee_id is required")
	}
	return s.repo.ReassignCaseWorkflow(ctx, caseID, req)
}

func (s Service) RecordDecision(ctx context.Context, caseID string, req RecordDecisionRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if len(req.ReasonCodes) == 0 {
		return CaseDetail{}, errors.New("at least one reason code is required")
	}
	if strings.TrimSpace(req.Note) == "" {
		return CaseDetail{}, errors.New("note is required")
	}

	reasonCodes, err := s.repo.ListReasonCodes(ctx)
	if err != nil {
		return CaseDetail{}, fmt.Errorf("loading reason codes: %w", err)
	}

	codeMap := make(map[string]ReasonCode, len(reasonCodes))
	for _, rc := range reasonCodes {
		codeMap[rc.Code] = rc
	}

	var hasHardBlock, hasClearSupport, hasUnresolved bool
	for _, code := range req.ReasonCodes {
		rc, ok := codeMap[code]
		if !ok {
			return CaseDetail{}, fmt.Errorf("unknown reason code: %s", code)
		}
		switch rc.Category {
		case ReasonCategoryHardBlock:
			hasHardBlock = true
		case ReasonCategoryClearSupport:
			hasClearSupport = true
		case ReasonCategoryReviewTrigger:
			// allowed for stop
		case ReasonCategoryUnresolvedInformation:
			hasUnresolved = true
		}
	}

	switch req.Decision {
	case DecisionClear:
		if hasHardBlock {
			return CaseDetail{}, errors.New("clear decision cannot include hard_block reason codes")
		}
		if hasUnresolved {
			return CaseDetail{}, errors.New("clear decision cannot include unresolved_information reason codes")
		}
		if !hasClearSupport {
			return CaseDetail{}, errors.New("clear decision requires at least one clear_support reason code")
		}
	case DecisionReview:
		if hasHardBlock {
			return CaseDetail{}, errors.New("review decision cannot include hard_block reason codes")
		}
		if hasClearSupport {
			return CaseDetail{}, errors.New("review decision cannot include clear_support reason codes")
		}
	case DecisionStop:
		if !hasHardBlock {
			return CaseDetail{}, errors.New("stop decision requires at least one hard_block reason code")
		}
	default:
		return CaseDetail{}, errors.New("invalid decision")
	}

	return s.repo.RecordDecisionWorkflow(ctx, caseID, req)
}

func (s Service) CloseUnresolved(ctx context.Context, caseID string, req CloseUnresolvedRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	if len(req.ReasonCodes) == 0 {
		return CaseDetail{}, errors.New("at least one reason code is required")
	}
	if strings.TrimSpace(req.Note) == "" {
		return CaseDetail{}, errors.New("note is required")
	}

	reasonCodes, err := s.repo.ListReasonCodes(ctx)
	if err != nil {
		return CaseDetail{}, fmt.Errorf("loading reason codes: %w", err)
	}

	codeMap := make(map[string]ReasonCode, len(reasonCodes))
	for _, rc := range reasonCodes {
		codeMap[rc.Code] = rc
	}

	var hasUnresolved bool
	for _, code := range req.ReasonCodes {
		rc, ok := codeMap[code]
		if !ok {
			return CaseDetail{}, fmt.Errorf("unknown reason code: %s", code)
		}
		if rc.Category == ReasonCategoryUnresolvedInformation {
			hasUnresolved = true
		}
	}

	if !hasUnresolved {
		return CaseDetail{}, errors.New("unresolved closure requires at least one unresolved_information reason code")
	}

	return s.repo.CloseUnresolvedWorkflow(ctx, caseID, req)
}

func (s Service) ReopenCase(ctx context.Context, caseID string, req ReopenCaseRequest) (CaseDetail, error) {
	if strings.TrimSpace(req.ActorID) == "" {
		return CaseDetail{}, errors.New("actor_id is required")
	}
	return s.repo.ReopenCaseWorkflow(ctx, caseID, req)
}

func generateCaseReference() string {
	return fmt.Sprintf("TC-%d", time.Now().UnixNano())
}
