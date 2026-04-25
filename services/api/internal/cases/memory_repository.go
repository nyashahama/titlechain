// Package cases provides the case workflow domain. This file contains an in-memory
// repository implementation intended for testing only. Do not use in production.
package cases

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/nyasha-hama/titlechain/services/api/internal/decisioning"
)

type memoryRepository struct {
	mu          sync.RWMutex
	analysts    []Analyst
	reasonCodes []ReasonCode
	cases       map[string]*caseRecord
	evidence    map[string][]EvidenceItem
	parties     map[string][]Party
	decisions   map[string][]Decision
	proposals   map[string][]DecisionProposal
	matches     map[string][]PropertyMatch
	auditEvents map[string][]AuditEvent
	caseRefSeq  int
}

type caseRecord struct {
	CaseSummary
	IntakeNote           string
	LinkedSeedPropertyID string
	ResolvedAt           *time.Time
}

func NewMemoryRepository() *memoryRepository {
	return &memoryRepository{
		analysts:    seedAnalysts(),
		reasonCodes: FixedReasonCodes,
		cases:       make(map[string]*caseRecord),
		evidence:    make(map[string][]EvidenceItem),
		parties:     make(map[string][]Party),
		decisions:   make(map[string][]Decision),
		proposals:   make(map[string][]DecisionProposal),
		matches:     make(map[string][]PropertyMatch),
		auditEvents: make(map[string][]AuditEvent),
	}
}

func seedAnalysts() []Analyst {
	return []Analyst{
		{ID: "ana-001", DisplayName: "Nyasha Hama", Email: "nyasha@titlechain.local", Active: true},
		{ID: "ana-002", DisplayName: "Amina Patel", Email: "amina@titlechain.local", Active: true},
		{ID: "ana-003", DisplayName: "Thabo Mokoena", Email: "thabo@titlechain.local", Active: true},
	}
}

func (r *memoryRepository) ListAnalysts(_ context.Context) ([]Analyst, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return append([]Analyst{}, r.analysts...), nil
}

func (r *memoryRepository) ListReasonCodes(_ context.Context) ([]ReasonCode, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return append([]ReasonCode{}, r.reasonCodes...), nil
}

func (r *memoryRepository) ListCases(_ context.Context, filter ListCasesFilter) ([]CaseSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []CaseSummary
	for _, c := range r.cases {
		if filter.Status != "" && string(c.Status) != filter.Status {
			continue
		}
		if filter.AssigneeID != "" && c.AssigneeID != filter.AssigneeID {
			continue
		}
		result = append(result, c.CaseSummary)
	}

	if filter.Limit > 0 && int32(len(result)) > filter.Limit {
		result = result[:filter.Limit]
	}
	return result, nil
}

func (r *memoryRepository) GetCaseDetail(_ context.Context, caseID string) (CaseDetail, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) getCaseDetailLocked(caseID string) (CaseDetail, error) {
	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	detail := CaseDetail{
		Case:        c.CaseSummary,
		Matches:     append([]PropertyMatch{}, r.matches[caseID]...),
		Evidence:    append([]EvidenceItem{}, r.evidence[caseID]...),
		Parties:     append([]Party{}, r.parties[caseID]...),
		Decisions:   append([]Decision{}, r.decisions[caseID]...),
		AuditEvents: append([]AuditEvent{}, r.auditEvents[caseID]...),
	}

	// Enrich decisions with reason codes
	for i := range detail.Decisions {
		detail.Decisions[i].ReasonCodes = append([]ReasonCode{}, detail.Decisions[i].ReasonCodes...)
	}

	if proposal, ok := r.currentProposalLocked(caseID); ok {
		detail.CurrentProposal = &proposal
	}

	return detail, nil
}

func (r *memoryRepository) CreateCaseWorkflow(_ context.Context, req CreateCaseRequest, caseReference string) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.caseRefSeq++
	id := fmt.Sprintf("case-%d", r.caseRefSeq)
	now := time.Now()

	status := CaseStatusOpen
	linkedSeedPropertyID := ""
	linkedPropertyID := ""
	if req.SeedPropertyID != "" {
		status = CaseStatusInReview
		linkedSeedPropertyID = req.SeedPropertyID
	}
	if req.LinkedPropertyID != "" {
		status = CaseStatusInReview
		linkedPropertyID = req.LinkedPropertyID
	}

	c := &caseRecord{
		CaseSummary: CaseSummary{
			ID:                        id,
			CaseReference:             caseReference,
			PropertyDescription:       req.PropertyDescription,
			LocalityOrArea:            req.LocalityOrArea,
			MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
			TitleReference:            req.TitleReference,
			MatterReference:           req.MatterReference,
			Status:                    status,
			AssigneeID:                req.ActorID,
			CreatedBy:                 req.ActorID,
			LinkedSeedPropertyID:      linkedSeedPropertyID,
			LinkedPropertyID:          linkedPropertyID,
			CreatedAt:                 now,
			UpdatedAt:                 now,
		},
		IntakeNote: req.IntakeNote,
	}

	r.cases[id] = c
	r.addAuditEventLocked(id, req.ActorID, AuditCaseCreated, map[string]any{
		"case_reference": caseReference,
	})

	if req.SeedPropertyID != "" {
		matchID := fmt.Sprintf("match-%d", len(r.matches[id])+1)
		r.matches[id] = append(r.matches[id], PropertyMatch{
			ID:             matchID,
			CaseID:         id,
			SeedPropertyID: req.SeedPropertyID,
			MatchSource:    "property_selection",
			Confidence:     100,
			Status:         "confirmed",
			ConfirmedBy:    req.ActorID,
			ConfirmedAt:    now,
			CreatedAt:      now,
		})
		r.addAuditEventLocked(id, req.ActorID, AuditPropertyMatchConfirmed, map[string]any{
			"match_id":         matchID,
			"seed_property_id": req.SeedPropertyID,
		})
	}

	if req.LinkedPropertyID != "" {
		c.LinkedPropertyID = req.LinkedPropertyID
		r.evidence[id] = append(r.evidence[id], EvidenceItem{
			ID:                fmt.Sprintf("evi-%d-1", len(r.evidence[id])+1),
			CaseID:            id,
			EvidenceType:      "canonical_property",
			SourceType:        "normalized_data",
			SourceReference:   "source-link-1",
			ExternalReference: "core.properties",
			ExtractedFacts: map[string]any{
				"linked_property_id": req.LinkedPropertyID,
				"source_link_id":     "source-link-1",
				"batch_id":           "batch-1",
				"source_record_id":   "record-1",
				"fact_table":         "core.properties",
				"fact_id":            req.LinkedPropertyID,
			},
			EvidenceStatus: EvidenceStatusConfirmed,
			CreatedBy:      req.ActorID,
			CreatedAt:      now,
		})
	}

	r.evaluateAndPersistProposalLocked(id)

	return r.getCaseDetailLocked(id)
}

func (r *memoryRepository) ConfirmPropertyMatchWorkflow(_ context.Context, caseID string, req ConfirmPropertyMatchRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	if req.Action == "confirm" {
		found := false
		for i := range r.matches[caseID] {
			if r.matches[caseID][i].ID == req.MatchID {
				r.matches[caseID][i].Status = "confirmed"
				r.matches[caseID][i].ConfirmedBy = req.ActorID
				now := time.Now()
				r.matches[caseID][i].ConfirmedAt = now
				c.Status = CaseStatusInReview
				c.LinkedSeedPropertyID = r.matches[caseID][i].SeedPropertyID
				c.UpdatedAt = now
				found = true
				break
			}
		}
		if !found {
			return CaseDetail{}, errors.New("match not found")
		}
		r.addAuditEventLocked(caseID, req.ActorID, AuditPropertyMatchConfirmed, map[string]any{
			"match_id": req.MatchID,
		})
	} else {
		for i := range r.matches[caseID] {
			if r.matches[caseID][i].ID == req.MatchID {
				r.matches[caseID][i].Status = "rejected"
			}
		}
		r.addAuditEventLocked(caseID, req.ActorID, AuditPropertyMatchRejected, map[string]any{
			"match_id": req.MatchID,
		})
	}

	r.evaluateAndPersistProposalLocked(caseID)

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) AddEvidenceWorkflow(_ context.Context, caseID string, req AddEvidenceRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.cases[caseID]; !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	id := fmt.Sprintf("evi-%d", len(r.evidence[caseID])+1)
	now := time.Now()

	r.evidence[caseID] = append(r.evidence[caseID], EvidenceItem{
		ID:                id,
		CaseID:            caseID,
		EvidenceType:      req.EvidenceType,
		SourceType:        req.SourceType,
		SourceReference:   req.SourceReference,
		ExternalReference: req.ExternalReference,
		Excerpt:           req.Excerpt,
		ExtractedFacts:    req.ExtractedFacts,
		EvidenceStatus:    req.EvidenceStatus,
		AnalystNote:       req.AnalystNote,
		CreatedBy:         req.ActorID,
		CreatedAt:         now,
	})

	r.addAuditEventLocked(caseID, req.ActorID, AuditEvidenceAdded, map[string]any{
		"evidence_id": id,
	})

	r.evaluateAndPersistProposalLocked(caseID)

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) AddPartyWorkflow(_ context.Context, caseID string, req AddPartyRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.cases[caseID]; !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	id := fmt.Sprintf("pty-%d", len(r.parties[caseID])+1)
	now := time.Now()

	r.parties[caseID] = append(r.parties[caseID], Party{
		ID:          id,
		CaseID:      caseID,
		Role:        req.Role,
		EntityType:  req.EntityType,
		DisplayName: req.DisplayName,
		Identifier:  req.Identifier,
		Note:        req.Note,
		CreatedBy:   req.ActorID,
		CreatedAt:   now,
	})

	r.addAuditEventLocked(caseID, req.ActorID, AuditPartyAdded, map[string]any{
		"party_id": id,
	})

	r.evaluateAndPersistProposalLocked(caseID)

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) ReassignCaseWorkflow(_ context.Context, caseID string, req ReassignCaseRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	oldAssignee := c.AssigneeID
	c.AssigneeID = req.AssigneeID
	c.UpdatedAt = time.Now()

	r.addAuditEventLocked(caseID, req.ActorID, AuditAssigneeChanged, map[string]any{
		"from": oldAssignee,
		"to":   req.AssigneeID,
	})

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) ReevaluateCaseWorkflow(_ context.Context, caseID, actorID string) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.cases[caseID]; !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	r.evaluateAndPersistProposalLocked(caseID)
	r.addAuditEventLocked(caseID, actorID, "case_evaluated", map[string]any{
		"engine_version": decisioning.EngineVersion,
	})
	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) AcceptProposalWorkflow(_ context.Context, caseID string, req AcceptProposalRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	proposal, ok := r.currentProposalLocked(caseID)
	if !ok {
		return CaseDetail{}, errors.New("no current proposal")
	}

	for i := range r.decisions[caseID] {
		if r.decisions[caseID][i].Status == "current" {
			r.decisions[caseID][i].Status = "superseded"
		}
	}

	note := strings.TrimSpace(req.Note)
	if note == "" {
		note = proposal.Summary
	}

	reasonCodes := append([]ReasonCode{}, proposal.ReasonCodes...)
	now := time.Now()
	decisionID := fmt.Sprintf("dec-%d", len(r.decisions[caseID])+1)
	r.decisions[caseID] = append(r.decisions[caseID], Decision{
		ID:             decisionID,
		CaseID:         caseID,
		Decision:       proposal.Decision,
		ReasonCodes:    reasonCodes,
		Note:           note,
		Status:         "current",
		CreatedBy:      req.ActorID,
		CreatedAt:      now,
		DecisionSource: DecisionSourceAcceptedProposal,
		ProposalID:     proposal.ID,
	})

	c.Status = CaseStatusResolved
	c.ResolvedAt = &now
	c.UpdatedAt = now

	for i := range r.proposals[caseID] {
		if r.proposals[caseID][i].Status == "current" {
			r.proposals[caseID][i].Status = "superseded"
		}
	}

	r.addAuditEventLocked(caseID, req.ActorID, AuditDecisionRecorded, map[string]any{
		"decision":        proposal.Decision,
		"decision_id":     decisionID,
		"decision_source": DecisionSourceAcceptedProposal,
		"proposal_id":     proposal.ID,
	})

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) RecordDecisionWorkflow(_ context.Context, caseID string, req RecordDecisionRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	// Supersede current decisions
	for i := range r.decisions[caseID] {
		if r.decisions[caseID][i].Status == "current" {
			r.decisions[caseID][i].Status = "superseded"
		}
	}

	codeMap := make(map[string]ReasonCode)
	for _, rc := range r.reasonCodes {
		codeMap[rc.Code] = rc
	}

	var reasonCodes []ReasonCode
	for _, code := range req.ReasonCodes {
		if rc, ok := codeMap[code]; ok {
			reasonCodes = append(reasonCodes, rc)
		}
	}

	id := fmt.Sprintf("dec-%d", len(r.decisions[caseID])+1)
	now := time.Now()

	decisionSource := DecisionSourceManual
	if proposal, ok := r.currentProposalLocked(caseID); ok {
		if proposal.Decision != req.Decision || !sameReasonCodeSet(proposal.ReasonCodes, req.ReasonCodes) {
			decisionSource = DecisionSourceManualOverride
		}
	}

	r.decisions[caseID] = append(r.decisions[caseID], Decision{
		ID:             id,
		CaseID:         caseID,
		Decision:       req.Decision,
		ReasonCodes:    reasonCodes,
		Note:           req.Note,
		Status:         "current",
		CreatedBy:      req.ActorID,
		CreatedAt:      now,
		DecisionSource: decisionSource,
	})

	c.Status = CaseStatusResolved
	c.ResolvedAt = &now
	c.UpdatedAt = now

	r.addAuditEventLocked(caseID, req.ActorID, AuditDecisionRecorded, map[string]any{
		"decision":        req.Decision,
		"decision_id":     id,
		"decision_source": decisionSource,
	})

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) CloseUnresolvedWorkflow(_ context.Context, caseID string, req CloseUnresolvedRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	now := time.Now()
	c.Status = CaseStatusClosedUnresolved
	c.ResolvedAt = &now
	c.UpdatedAt = now

	r.addAuditEventLocked(caseID, req.ActorID, AuditCaseClosedUnresolved, map[string]any{
		"reason_codes": req.ReasonCodes,
		"note":         req.Note,
	})

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) ReopenCaseWorkflow(_ context.Context, caseID string, req ReopenCaseRequest) (CaseDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	c, ok := r.cases[caseID]
	if !ok {
		return CaseDetail{}, errors.New("case not found")
	}

	now := time.Now()
	c.Status = CaseStatusReopened
	c.ResolvedAt = nil
	c.UpdatedAt = now

	r.addAuditEventLocked(caseID, req.ActorID, AuditCaseReopened, map[string]any{
		"note": req.Note,
	})

	r.evaluateAndPersistProposalLocked(caseID)

	return r.getCaseDetailLocked(caseID)
}

func (r *memoryRepository) currentProposalLocked(caseID string) (DecisionProposal, bool) {
	for _, proposal := range r.proposals[caseID] {
		if proposal.Status == "current" {
			return cloneProposal(proposal), true
		}
	}
	return DecisionProposal{}, false
}

func (r *memoryRepository) evaluateAndPersistProposalLocked(caseID string) {
	c, ok := r.cases[caseID]
	if !ok {
		return
	}

	snapshot := r.buildSnapshotLocked(caseID, c.CaseSummary)
	facts := decisioning.BuildFacts(snapshot)
	proposal := decisioning.Evaluate(facts)

	for i := range r.proposals[caseID] {
		if r.proposals[caseID][i].Status == "current" {
			r.proposals[caseID][i].Status = "superseded"
		}
	}

	id := fmt.Sprintf("prop-%d", len(r.proposals[caseID])+1)
	now := time.Now()
	r.proposals[caseID] = append(r.proposals[caseID], DecisionProposal{
		ID:            id,
		EngineVersion: proposal.EngineVersion,
		Decision:      DecisionOutcome(proposal.Decision),
		Summary:       proposal.Summary,
		ReasonCodes:   r.materializeReasonCodes(proposal.ReasonCodes),
		Explanation:   cloneExplanation(proposal.Explanation),
		Status:        "current",
		CreatedAt:     now,
	})
}

func (r *memoryRepository) buildSnapshotLocked(caseID string, c CaseSummary) decisioning.NormalizedSnapshot {
	snapshot := decisioning.NormalizedSnapshot{
		LinkedPropertyID:   strings.TrimSpace(c.LinkedPropertyID),
		CaseTitleReference: strings.TrimSpace(c.TitleReference),
		OwnershipAligned:   true,
	}

	canonicalTitle := canonicalTitleReference(snapshot.LinkedPropertyID)
	titleStatus := canonicalTitleStatus(snapshot.LinkedPropertyID)
	hasQuarantinedRows := canonicalQuarantineStatus(snapshot.LinkedPropertyID)
	hasActiveEncumbrance := canonicalEncumbranceConflict(snapshot.LinkedPropertyID)
	sourceCoverage := snapshot.LinkedPropertyID != "" && canonicalTitle != ""
	hasConflictingEvidence := false
	hasFraudSignal := false

	for _, ev := range r.evidence[caseID] {
		if ev.EvidenceStatus == EvidenceStatusConflicting || strings.EqualFold(ev.EvidenceType, "source_conflict") {
			hasConflictingEvidence = true
		}
		evType := strings.ToLower(strings.TrimSpace(ev.EvidenceType))
		if strings.Contains(evType, "fraud") || strings.Contains(evType, "anomaly") {
			hasFraudSignal = true
		}
		if v, ok := ev.ExtractedFacts["canonical_title_reference"].(string); ok && strings.TrimSpace(v) != "" {
			canonicalTitle = strings.TrimSpace(v)
		}
		if v, ok := ev.ExtractedFacts["title_status"].(string); ok && strings.TrimSpace(v) != "" {
			titleStatus = strings.TrimSpace(v)
		}
		if v, ok := ev.ExtractedFacts["has_active_encumbrance"].(bool); ok {
			hasActiveEncumbrance = hasActiveEncumbrance || v
		}
		if v, ok := ev.ExtractedFacts["has_quarantined_rows"].(bool); ok {
			hasQuarantinedRows = hasQuarantinedRows || v
		}
	}

	ownersAligned, hasPartyVariance := evaluateMemoryPartyAlignment(r.parties[caseID], canonicalOwners(snapshot.LinkedPropertyID))
	snapshot.CanonicalTitleReference = canonicalTitle
	snapshot.TitleStatus = titleStatus
	snapshot.HasActiveEncumbrance = hasActiveEncumbrance
	snapshot.HasQuarantinedRows = hasQuarantinedRows
	snapshot.SourceCoverageSufficient = sourceCoverage
	snapshot.OwnershipAligned = ownersAligned
	snapshot.HasPartyVariance = hasPartyVariance
	snapshot.HasConflictingEvidence = hasConflictingEvidence
	snapshot.HasFraudSignal = hasFraudSignal

	return snapshot
}

func (r *memoryRepository) materializeReasonCodes(codes []string) []ReasonCode {
	codeMap := make(map[string]ReasonCode, len(r.reasonCodes))
	for _, rc := range r.reasonCodes {
		codeMap[rc.Code] = rc
	}
	result := make([]ReasonCode, 0, len(codes))
	for _, code := range codes {
		if rc, ok := codeMap[code]; ok {
			result = append(result, rc)
		}
	}
	return result
}

func sameReasonCodeSet(reasonCodes []ReasonCode, requestCodes []string) bool {
	if len(reasonCodes) != len(requestCodes) {
		return false
	}
	left := make([]string, 0, len(reasonCodes))
	for _, rc := range reasonCodes {
		left = append(left, rc.Code)
	}
	right := append([]string{}, requestCodes...)
	slices.Sort(left)
	slices.Sort(right)
	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}
	return true
}

func evaluateMemoryPartyAlignment(caseParties []Party, canonical []string) (bool, bool) {
	if len(caseParties) == 0 || len(canonical) == 0 {
		return true, false
	}

	canonicalSet := make(map[string]struct{}, len(canonical))
	for _, owner := range canonical {
		canonicalSet[normalizeMemoryPartyName(owner)] = struct{}{}
	}

	caseOwners := make([]string, 0, len(caseParties))
	for _, p := range caseParties {
		role := strings.ToLower(strings.TrimSpace(p.Role))
		if role != "seller" && role != "owner" {
			continue
		}
		normalized := normalizeMemoryPartyName(p.DisplayName)
		if normalized != "" {
			caseOwners = append(caseOwners, normalized)
		}
	}
	if len(caseOwners) == 0 {
		return true, false
	}

	matches := 0
	for _, owner := range caseOwners {
		if _, ok := canonicalSet[owner]; ok {
			matches++
		}
	}

	aligned := matches > 0
	variance := matches != len(caseOwners)
	return aligned, variance
}

func normalizeMemoryPartyName(v string) string {
	v = strings.ToLower(strings.TrimSpace(v))
	v = strings.ReplaceAll(v, ".", "")
	v = strings.Join(strings.Fields(v), " ")
	return v
}

func canonicalTitleReference(linkedPropertyID string) string {
	switch strings.TrimSpace(linkedPropertyID) {
	case "prop-1":
		return "T12345/2024"
	case "prop-2":
		return "ST7788/2023"
	case "prop-3":
		return "T9988/2022"
	case "prop-4":
		return ""
	default:
		return ""
	}
}

func canonicalTitleStatus(linkedPropertyID string) string {
	switch strings.TrimSpace(linkedPropertyID) {
	case "prop-3":
		return "active_interdict"
	default:
		return ""
	}
}

func canonicalEncumbranceConflict(linkedPropertyID string) bool {
	return strings.TrimSpace(linkedPropertyID) == "prop-bond-conflict"
}

func canonicalQuarantineStatus(linkedPropertyID string) bool {
	return strings.TrimSpace(linkedPropertyID) == "prop-2" || strings.TrimSpace(linkedPropertyID) == "prop-4"
}

func canonicalOwners(linkedPropertyID string) []string {
	switch strings.TrimSpace(linkedPropertyID) {
	case "prop-1":
		return []string{"Maseko Family Trust"}
	case "prop-2":
		return []string{"Harbor View Holdings Pty Ltd"}
	case "prop-3":
		return []string{"Ndlovu Property Holdings"}
	default:
		return nil
	}
}

func cloneProposal(p DecisionProposal) DecisionProposal {
	p.ReasonCodes = append([]ReasonCode{}, p.ReasonCodes...)
	p.Explanation = cloneExplanation(p.Explanation)
	return p
}

func cloneExplanation(v map[string]any) map[string]any {
	if v == nil {
		return nil
	}
	data, err := json.Marshal(v)
	if err != nil {
		return map[string]any{}
	}
	var out map[string]any
	if err := json.Unmarshal(data, &out); err != nil {
		return map[string]any{}
	}
	return out
}

func (r *memoryRepository) addAuditEventLocked(caseID, actorID, eventType string, metadata map[string]any) {
	id := fmt.Sprintf("aud-%d", len(r.auditEvents[caseID])+1)
	r.auditEvents[caseID] = append(r.auditEvents[caseID], AuditEvent{
		ID:        id,
		CaseID:    caseID,
		ActorID:   actorID,
		EventType: eventType,
		Metadata:  metadata,
		CreatedAt: time.Now(),
	})
}

// Helper for tests to add a property match
func (r *memoryRepository) addPropertyMatch(caseID string, match PropertyMatch) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.matches[caseID] = append(r.matches[caseID], match)
}
