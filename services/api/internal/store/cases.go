package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type CasesStore struct {
	pool *pgxpool.Pool
}

var _ cases.Repository = CasesStore{}

func NewCasesStore(pool *pgxpool.Pool) CasesStore {
	return CasesStore{pool: pool}
}

func (s CasesStore) ListAnalysts(ctx context.Context) ([]cases.Analyst, error) {
	queries := sqlc.New(s.pool)
	rows, err := queries.ListAnalysts(ctx)
	if err != nil {
		return nil, err
	}

	var result []cases.Analyst
	for _, row := range rows {
		result = append(result, cases.Analyst{
			ID:          row.ID,
			DisplayName: row.DisplayName,
			Email:       row.Email,
			Active:      row.Active,
			CreatedAt:   row.CreatedAt.Time,
		})
	}
	return result, nil
}

func (s CasesStore) ListReasonCodes(ctx context.Context) ([]cases.ReasonCode, error) {
	queries := sqlc.New(s.pool)
	rows, err := queries.ListReasonCodes(ctx)
	if err != nil {
		return nil, err
	}

	var result []cases.ReasonCode
	for _, row := range rows {
		result = append(result, cases.ReasonCode{
			Code:        row.Code,
			Label:       row.Label,
			Category:    cases.ReasonCategory(row.Category),
			IsHardBlock: row.IsHardBlock,
			Active:      row.Active,
			SortOrder:   row.SortOrder,
		})
	}
	return result, nil
}

func (s CasesStore) ListCases(ctx context.Context, filter cases.ListCasesFilter) ([]cases.CaseSummary, error) {
	queries := sqlc.New(s.pool)

	var status, assigneeID pgtype.Text
	if filter.Status != "" {
		status = pgtype.Text{String: filter.Status, Valid: true}
	}
	if filter.AssigneeID != "" {
		assigneeID = pgtype.Text{String: filter.AssigneeID, Valid: true}
	}

	limit := filter.Limit
	if limit == 0 {
		limit = 100
	}

	rows, err := queries.ListCaseSummaries(ctx, sqlc.ListCaseSummariesParams{
		Status:     status,
		AssigneeID: assigneeID,
		Limit:      limit,
	})
	if err != nil {
		return nil, err
	}

	var result []cases.CaseSummary
	for _, row := range rows {
		result = append(result, caseSummaryFromRow(row))
	}
	return result, nil
}

func (s CasesStore) GetCaseDetail(ctx context.Context, caseID string) (cases.CaseDetail, error) {
	queries := sqlc.New(s.pool)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	c, err := queries.GetCaseRecord(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return cases.CaseDetail{}, errors.New("case not found")
		}
		return cases.CaseDetail{}, err
	}

	matches, err := queries.ListCasePropertyMatches(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	evidence, err := queries.ListCaseEvidence(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	parties, err := queries.ListCaseParties(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	decisions, err := queries.ListCaseDecisions(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	auditEvents, err := queries.ListCaseAuditEvents(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	detail := cases.CaseDetail{
		Case:        caseSummaryFromRecord(c),
		Matches:     propertyMatchesFromRows(matches),
		Evidence:    evidenceItemsFromRows(evidence),
		Parties:     partiesFromRows(parties),
		AuditEvents: auditEventsFromRows(auditEvents),
	}

	// Enrich decisions with reason codes
	for _, d := range decisions {
		dec := decisionFromRow(d)
		rcRows, err := queries.ListDecisionReasonCodes(ctx, d.ID)
		if err != nil {
			return cases.CaseDetail{}, err
		}
		for _, rc := range rcRows {
			dec.ReasonCodes = append(dec.ReasonCodes, cases.ReasonCode{
				Code:        rc.Code,
				Label:       rc.Label,
				Category:    cases.ReasonCategory(rc.Category),
				IsHardBlock: rc.IsHardBlock,
				Active:      rc.Active,
				SortOrder:   rc.SortOrder,
			})
		}
		detail.Decisions = append(detail.Decisions, dec)
	}

	return detail, nil
}

func (s CasesStore) CreateCaseWorkflow(ctx context.Context, req cases.CreateCaseRequest, caseReference string) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)

	c, err := queries.CreateCaseRecord(ctx, sqlc.CreateCaseRecordParams{
		CaseReference:             caseReference,
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
		TitleReference:            pgtype.Text{String: req.TitleReference, Valid: req.TitleReference != ""},
		MatterReference:           pgtype.Text{String: req.MatterReference, Valid: req.MatterReference != ""},
		IntakeNote:                pgtype.Text{String: req.IntakeNote, Valid: req.IntakeNote != ""},
		AssigneeID:                req.ActorID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	// Create seed property matches
	seedProps, err := queries.ListSeedPropertyMatches(ctx, sqlc.ListSeedPropertyMatchesParams{
		Lower:   req.PropertyDescription,
		Lower_2: req.LocalityOrArea,
		Lower_3: req.MunicipalityOrDeedsOffice,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	for _, sp := range seedProps {
		_, err := queries.CreatePropertyMatch(ctx, sqlc.CreatePropertyMatchParams{
			CaseID:         c.ID,
			SeedPropertyID: sp.ID,
			MatchSource:    "seeded_fuzzy_match",
			Confidence:     pgtype.Numeric{Valid: true}, // default 0, refine later
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}
		_ = err
	}

	// Create audit event
	meta, _ := json.Marshal(map[string]any{"case_reference": caseReference})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    c.ID,
		ActorID:   req.ActorID,
		EventType: cases.AuditCaseCreated,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, uuidToString(c.ID))
}

func (s CasesStore) ConfirmPropertyMatchWorkflow(ctx context.Context, caseID string, req cases.ConfirmPropertyMatchRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	matchID, err := parseUUID(req.MatchID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if req.Action == "confirm" {
		confirmed, err := queries.ConfirmCasePropertyMatch(ctx, sqlc.ConfirmCasePropertyMatchParams{
			CaseID: id,
			ID:     matchID,
			ConfirmedBy: pgtype.Text{String: req.ActorID, Valid: true},
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		_, err = queries.LinkCaseSeedProperty(ctx, sqlc.LinkCaseSeedPropertyParams{
			ID:                   id,
			LinkedSeedPropertyID: confirmed.SeedPropertyID,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		meta, _ := json.Marshal(map[string]any{"match_id": req.MatchID})
		_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
			CaseID:    id,
			ActorID:   req.ActorID,
			EventType: cases.AuditPropertyMatchConfirmed,
			Metadata:  meta,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}
	} else {
		err := queries.RejectCasePropertyMatches(ctx, id)
		if err != nil {
			return cases.CaseDetail{}, err
		}

		meta, _ := json.Marshal(map[string]any{"match_id": req.MatchID})
		_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
			CaseID:    id,
			ActorID:   req.ActorID,
			EventType: cases.AuditPropertyMatchRejected,
			Metadata:  meta,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) AddEvidenceWorkflow(ctx context.Context, caseID string, req cases.AddEvidenceRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	facts, _ := json.Marshal(req.ExtractedFacts)
	_, err = queries.AddCaseEvidence(ctx, sqlc.AddCaseEvidenceParams{
		CaseID:            id,
		EvidenceType:      req.EvidenceType,
		SourceType:        req.SourceType,
		SourceReference:   req.SourceReference,
		ExternalReference: pgtype.Text{String: req.ExternalReference, Valid: req.ExternalReference != ""},
		Excerpt:           pgtype.Text{String: req.Excerpt, Valid: req.Excerpt != ""},
		ExtractedFacts:    facts,
		EvidenceStatus:    string(req.EvidenceStatus),
		AnalystNote:       pgtype.Text{String: req.AnalystNote, Valid: req.AnalystNote != ""},
		CreatedBy:         req.ActorID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"evidence_type": req.EvidenceType})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditEvidenceAdded,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) AddPartyWorkflow(ctx context.Context, caseID string, req cases.AddPartyRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	_, err = queries.AddCaseParty(ctx, sqlc.AddCasePartyParams{
		CaseID:      id,
		Role:        req.Role,
		EntityType:  req.EntityType,
		DisplayName: req.DisplayName,
		Identifier:  pgtype.Text{String: req.Identifier, Valid: req.Identifier != ""},
		Note:        pgtype.Text{String: req.Note, Valid: req.Note != ""},
		CreatedBy:   req.ActorID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"role": req.Role})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditPartyAdded,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) ReassignCaseWorkflow(ctx context.Context, caseID string, req cases.ReassignCaseRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	c, err := queries.ReassignCase(ctx, sqlc.ReassignCaseParams{
		ID:         id,
		AssigneeID: req.AssigneeID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"from": c.AssigneeID, "to": req.AssigneeID})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditAssigneeChanged,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) RecordDecisionWorkflow(ctx context.Context, caseID string, req cases.RecordDecisionRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	// Supersede current decisions
	queries.SupersedeCurrentDecisions(ctx, id)

	dec, err := queries.CreateCaseDecision(ctx, sqlc.CreateCaseDecisionParams{
		CaseID:    id,
		Decision:  string(req.Decision),
		Note:      req.Note,
		CreatedBy: req.ActorID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	for _, code := range req.ReasonCodes {
		queries.AddDecisionReasonCode(ctx, sqlc.AddDecisionReasonCodeParams{
			DecisionID: dec.ID,
			ReasonCode: code,
		})
	}

	_, err = queries.ResolveCase(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"decision": req.Decision, "reason_codes": req.ReasonCodes})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditDecisionRecorded,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) CloseUnresolvedWorkflow(ctx context.Context, caseID string, req cases.CloseUnresolvedRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	_, err = queries.CloseCaseUnresolved(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"reason_codes": req.ReasonCodes, "note": req.Note})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditCaseClosedUnresolved,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

func (s CasesStore) ReopenCaseWorkflow(ctx context.Context, caseID string, req cases.ReopenCaseRequest) (cases.CaseDetail, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)
	id, err := parseUUID(caseID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	_, err = queries.ReopenCase(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"note": req.Note})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    id,
		ActorID:   req.ActorID,
		EventType: cases.AuditCaseReopened,
		Metadata:  meta,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, caseID)
}

// Conversion helpers

func caseSummaryFromRow(row sqlc.ListCaseSummariesRow) cases.CaseSummary {
	return cases.CaseSummary{
		ID:                        uuidToString(row.ID),
		CaseReference:             row.CaseReference,
		PropertyDescription:       row.PropertyDescription,
		LocalityOrArea:            row.LocalityOrArea,
		MunicipalityOrDeedsOffice: row.MunicipalityOrDeedsOffice,
		TitleReference:            textToString(row.TitleReference),
		MatterReference:           textToString(row.MatterReference),
		Status:                    cases.CaseStatus(row.Status),
		AssigneeID:                row.AssigneeID,
		CreatedBy:                 row.CreatedBy,
		LinkedSeedPropertyID:      uuidToString(row.LinkedSeedPropertyID),
		CreatedAt:                 row.CreatedAt.Time,
		UpdatedAt:                 row.UpdatedAt.Time,
	}
}

func caseSummaryFromRecord(c sqlc.OpsCaseRecord) cases.CaseSummary {
	return cases.CaseSummary{
		ID:                        uuidToString(c.ID),
		CaseReference:             c.CaseReference,
		PropertyDescription:       c.PropertyDescription,
		LocalityOrArea:            c.LocalityOrArea,
		MunicipalityOrDeedsOffice: c.MunicipalityOrDeedsOffice,
		TitleReference:            textToString(c.TitleReference),
		MatterReference:           textToString(c.MatterReference),
		Status:                    cases.CaseStatus(c.Status),
		AssigneeID:                c.AssigneeID,
		CreatedBy:                 c.CreatedBy,
		LinkedSeedPropertyID:      uuidToString(c.LinkedSeedPropertyID),
		CreatedAt:                 c.CreatedAt.Time,
		UpdatedAt:                 c.UpdatedAt.Time,
	}
}

func propertyMatchesFromRows(rows []sqlc.OpsCasePropertyMatch) []cases.PropertyMatch {
	var result []cases.PropertyMatch
	for _, row := range rows {
		var confirmedBy string
		if row.ConfirmedBy.Valid {
			confirmedBy = row.ConfirmedBy.String
		}
		var confirmedAt time.Time
		if row.ConfirmedAt.Valid {
			confirmedAt = row.ConfirmedAt.Time
		}
		conf, _ := row.Confidence.Float64Value()
		result = append(result, cases.PropertyMatch{
			ID:             uuidToString(row.ID),
			CaseID:         uuidToString(row.CaseID),
			SeedPropertyID: uuidToString(row.SeedPropertyID),
			MatchSource:    row.MatchSource,
			Confidence:     conf.Float64,
			Status:         row.Status,
			ConfirmedBy:    confirmedBy,
			ConfirmedAt:    confirmedAt,
			CreatedAt:      row.CreatedAt.Time,
		})
	}
	return result
}

func evidenceItemsFromRows(rows []sqlc.OpsCaseEvidenceItem) []cases.EvidenceItem {
	var result []cases.EvidenceItem
	for _, row := range rows {
		var facts map[string]any
		_ = json.Unmarshal(row.ExtractedFacts, &facts)
		result = append(result, cases.EvidenceItem{
			ID:                uuidToString(row.ID),
			CaseID:            uuidToString(row.CaseID),
			EvidenceType:      row.EvidenceType,
			SourceType:        row.SourceType,
			SourceReference:   row.SourceReference,
			ExternalReference: textToString(row.ExternalReference),
			Excerpt:           textToString(row.Excerpt),
			ExtractedFacts:    facts,
			EvidenceStatus:    cases.EvidenceStatus(row.EvidenceStatus),
			AnalystNote:       textToString(row.AnalystNote),
			CreatedBy:         row.CreatedBy,
			CreatedAt:         row.CreatedAt.Time,
		})
	}
	return result
}

func partiesFromRows(rows []sqlc.OpsCaseParty) []cases.Party {
	var result []cases.Party
	for _, row := range rows {
		result = append(result, cases.Party{
			ID:          uuidToString(row.ID),
			CaseID:      uuidToString(row.CaseID),
			Role:        row.Role,
			EntityType:  row.EntityType,
			DisplayName: row.DisplayName,
			Identifier:  textToString(row.Identifier),
			Note:        textToString(row.Note),
			CreatedBy:   row.CreatedBy,
			CreatedAt:   row.CreatedAt.Time,
		})
	}
	return result
}

func decisionFromRow(row sqlc.OpsCaseDecision) cases.Decision {
	return cases.Decision{
		ID:        uuidToString(row.ID),
		CaseID:    uuidToString(row.CaseID),
		Decision:  cases.DecisionOutcome(row.Decision),
		Note:      row.Note,
		Status:    row.Status,
		CreatedBy: row.CreatedBy,
		CreatedAt: row.CreatedAt.Time,
	}
}

func auditEventsFromRows(rows []sqlc.OpsCaseAuditEvent) []cases.AuditEvent {
	var result []cases.AuditEvent
	for _, row := range rows {
		var meta map[string]any
		_ = json.Unmarshal(row.Metadata, &meta)
		result = append(result, cases.AuditEvent{
			ID:        uuidToString(row.ID),
			CaseID:    uuidToString(row.CaseID),
			ActorID:   row.ActorID,
			EventType: row.EventType,
			Metadata:  meta,
			CreatedAt: row.CreatedAt.Time,
		})
	}
	return result
}

func parseUUID(s string) (pgtype.UUID, error) {
	var id pgtype.UUID
	if err := id.Scan(s); err != nil {
		return id, fmt.Errorf("invalid UUID: %w", err)
	}
	return id, nil
}

func uuidToString(u pgtype.UUID) string {
	if !u.Valid {
		return ""
	}
	// pgtype.UUID.Bytes is [16]byte in pgx v5
	return fmt.Sprintf("%x-%x-%x-%x-%x",
		u.Bytes[0:4], u.Bytes[4:6], u.Bytes[6:8], u.Bytes[8:10], u.Bytes[10:16])
}

func textToString(t pgtype.Text) string {
	if !t.Valid {
		return ""
	}
	return t.String
}
