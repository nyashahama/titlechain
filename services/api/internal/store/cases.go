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

type canonicalSourceLink struct {
	ID             string
	BatchID        string
	SourceRecordID string
	FactTable      string
	FactID         string
}

type canonicalEvidenceDraft struct {
	SourceReference   string
	ExternalReference string
	Facts             map[string]any
}

var _ cases.Repository = CasesStore{}

func NewCasesStore(pool *pgxpool.Pool) CasesStore {
	return CasesStore{pool: pool}
}

func buildCanonicalEvidenceDrafts(
	propertyID string,
	propertyDescription string,
	titleReference string,
	links []canonicalSourceLink,
) ([]canonicalEvidenceDraft, error) {
	if len(links) == 0 {
		return nil, errors.New("linked property has no source provenance")
	}

	drafts := make([]canonicalEvidenceDraft, 0, len(links))
	for _, link := range links {
		drafts = append(drafts, canonicalEvidenceDraft{
			SourceReference:   link.ID,
			ExternalReference: link.FactTable,
			Facts: map[string]any{
				"linked_property_id":   propertyID,
				"property_description": propertyDescription,
				"title_reference":      titleReference,
				"source_link_id":       link.ID,
				"batch_id":             link.BatchID,
				"source_record_id":     link.SourceRecordID,
				"fact_table":           link.FactTable,
				"fact_id":              link.FactID,
			},
		})
	}

	return drafts, nil
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

	result := make([]cases.CaseSummary, 0, len(rows))
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
		Decisions:   make([]cases.Decision, 0, len(decisions)),
		AuditEvents: auditEventsFromRows(auditEvents),
	}

	// Derive linked_property_id from canonical evidence
	for _, ev := range detail.Evidence {
		if ev.SourceType == "canonical_property" && ev.SourceReference != "" {
			detail.Case.LinkedPropertyID = ev.SourceReference
			break
		}
	}

	// Enrich decisions with reason codes
	for _, d := range decisions {
		dec := decisionFromRow(d)
		rcRows, err := queries.ListDecisionReasonCodes(ctx, d.ID)
		if err != nil {
			return cases.CaseDetail{}, err
		}
		dec.ReasonCodes = make([]cases.ReasonCode, 0, len(rcRows))
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

	// Derive LinkedPropertyID from canonical evidence to avoid schema migration
	for _, ev := range detail.Evidence {
		if ev.EvidenceType == "canonical_property" {
			if facts, ok := ev.ExtractedFacts["linked_property_id"]; ok {
				if str, ok := facts.(string); ok && str != "" {
					detail.Case.LinkedPropertyID = str
					break
				}
			}
			if detail.Case.LinkedPropertyID == "" && ev.SourceReference != "" {
				detail.Case.LinkedPropertyID = ev.SourceReference
				break
			}
		}
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

	var seedProp sqlc.OpsSeedProperty
	if req.SeedPropertyID != "" {
		seedID, err := parseUUID(req.SeedPropertyID)
		if err != nil {
			return cases.CaseDetail{}, fmt.Errorf("invalid seed_property_id: %w", err)
		}
		seedProp, err = queries.GetSeedProperty(ctx, seedID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return cases.CaseDetail{}, errors.New("seed property not found")
			}
			return cases.CaseDetail{}, err
		}
	}

	propertyDescription := req.PropertyDescription
	localityOrArea := req.LocalityOrArea
	municipalityOrDeedsOffice := req.MunicipalityOrDeedsOffice
	var titleReference pgtype.Text
	if req.SeedPropertyID != "" {
		propertyDescription = seedProp.PropertyDescription
		localityOrArea = seedProp.LocalityOrArea
		municipalityOrDeedsOffice = seedProp.MunicipalityOrDeedsOffice
		titleReference = seedProp.TitleReference
	} else {
		titleReference = pgtype.Text{String: req.TitleReference, Valid: req.TitleReference != ""}
	}

	var linkedPropID pgtype.UUID
	if req.LinkedPropertyID != "" {
		linkedPropID.Scan(req.LinkedPropertyID)
	}

	c, err := queries.CreateCaseRecord(ctx, sqlc.CreateCaseRecordParams{
		CaseReference:             caseReference,
		PropertyDescription:       propertyDescription,
		LocalityOrArea:            localityOrArea,
		MunicipalityOrDeedsOffice: municipalityOrDeedsOffice,
		TitleReference:            titleReference,
		MatterReference:           pgtype.Text{String: req.MatterReference, Valid: req.MatterReference != ""},
		IntakeNote:                pgtype.Text{String: req.IntakeNote, Valid: req.IntakeNote != ""},
		AssigneeID:                req.ActorID,
		LinkedPropertyID:          linkedPropID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if req.SeedPropertyID == "" {
		seedProps, err := queries.ListSeedPropertyMatches(ctx, sqlc.ListSeedPropertyMatchesParams{
			Lower:   req.PropertyDescription,
			Lower_2: req.LocalityOrArea,
			Lower_3: req.MunicipalityOrDeedsOffice,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		for _, sp := range seedProps {
			var confidence pgtype.Numeric
			_ = confidence.Scan("0")
			_, err := queries.CreatePropertyMatch(ctx, sqlc.CreatePropertyMatchParams{
				CaseID:         c.ID,
				SeedPropertyID: sp.ID,
				MatchSource:    "seeded_fuzzy_match",
				Confidence:     confidence,
			})
			if err != nil {
				return cases.CaseDetail{}, err
			}
		}
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

	if req.LinkedPropertyID != "" {
		propID, err := parseUUID(req.LinkedPropertyID)
		if err != nil {
			return cases.CaseDetail{}, fmt.Errorf("invalid linked_property_id: %w", err)
		}
		prop, err := queries.GetPropertySummary(ctx, propID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return cases.CaseDetail{}, errors.New("linked property not found")
			}
			return cases.CaseDetail{}, err
		}

		canonicalEvidence := []struct {
			EvidenceType string
			Excerpt      string
		}{
			{"property_description", prop.PropertyDescription},
			{"locality_or_area", prop.LocalityOrArea},
			{"municipality_or_deeds_office", prop.MunicipalityOrDeedsOffice},
		}
		if prop.TitleReference != "" {
			canonicalEvidence = append(canonicalEvidence, struct {
				EvidenceType string
				Excerpt      string
			}{"title_reference", prop.TitleReference})
		}
		if prop.CurrentOwnerName.Valid {
			canonicalEvidence = append(canonicalEvidence, struct {
				EvidenceType string
				Excerpt      string
			}{"current_owner_name", prop.CurrentOwnerName.String})
		}

		for _, item := range canonicalEvidence {
			facts, _ := json.Marshal(map[string]any{
				"property_id": req.LinkedPropertyID,
				"field":       item.EvidenceType,
			})
			_, err := queries.AddCaseEvidence(ctx, sqlc.AddCaseEvidenceParams{
				CaseID:          c.ID,
				EvidenceType:    item.EvidenceType,
				SourceType:      "canonical_property",
				SourceReference: req.LinkedPropertyID,
				Excerpt:         pgtype.Text{String: item.Excerpt, Valid: true},
				ExtractedFacts:  facts,
				EvidenceStatus:  string(cases.EvidenceStatusCaptured),
				CreatedBy:       req.ActorID,
			})
			if err != nil {
				return cases.CaseDetail{}, err
			}
		}
	}

	if req.SeedPropertyID != "" {
		seedID, _ := parseUUID(req.SeedPropertyID)
		var confidence pgtype.Numeric
		_ = confidence.Scan("100")
		match, err := queries.CreatePropertyMatch(ctx, sqlc.CreatePropertyMatchParams{
			CaseID:         c.ID,
			SeedPropertyID: seedID,
			MatchSource:    "property_selection",
			Confidence:     confidence,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		_, err = queries.ConfirmCasePropertyMatch(ctx, sqlc.ConfirmCasePropertyMatchParams{
			CaseID:      c.ID,
			ID:          match.ID,
			ConfirmedBy: pgtype.Text{String: req.ActorID, Valid: true},
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		_, err = queries.LinkCaseSeedProperty(ctx, sqlc.LinkCaseSeedPropertyParams{
			ID:                   c.ID,
			LinkedSeedPropertyID: seedID,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}

		matchMeta, _ := json.Marshal(map[string]any{"match_id": uuidToString(match.ID), "seed_property_id": req.SeedPropertyID})
		_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
			CaseID:    c.ID,
			ActorID:   req.ActorID,
			EventType: cases.AuditPropertyMatchConfirmed,
			Metadata:  matchMeta,
		})
		if err != nil {
			return cases.CaseDetail{}, err
		}
	}

	if req.LinkedPropertyID != "" {
		propID, err := parseUUID(req.LinkedPropertyID)
		if err != nil {
			return cases.CaseDetail{}, fmt.Errorf("invalid linked_property_id: %w", err)
		}

		// Try to get property summary
		propRow, err := queries.GetPropertySummary(ctx, propID)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return cases.CaseDetail{}, errors.New("linked property not found")
			}
			return cases.CaseDetail{}, err
		}

		sourceLinkRows, err := queries.ListCoreSourceLinksByProperty(ctx, propID)
		if err != nil {
			return cases.CaseDetail{}, err
		}

		sourceLinks := make([]canonicalSourceLink, 0, len(sourceLinkRows))
		for _, row := range sourceLinkRows {
			sourceLinks = append(sourceLinks, canonicalSourceLink{
				ID:             uuidToString(row.ID),
				BatchID:        uuidToString(row.BatchID),
				SourceRecordID: uuidToString(row.SourceRecordID),
				FactTable:      row.FactTable,
				FactID:         uuidToString(row.FactID),
			})
		}

		drafts, err := buildCanonicalEvidenceDrafts(
			req.LinkedPropertyID,
			propRow.PropertyDescription,
			propRow.TitleReference,
			sourceLinks,
		)
		if err != nil {
			return cases.CaseDetail{}, err
		}

		for _, draft := range drafts {
			facts, err := json.Marshal(draft.Facts)
			if err != nil {
				return cases.CaseDetail{}, fmt.Errorf("marshal canonical evidence facts: %w", err)
			}
			_, err = queries.AddCaseEvidence(ctx, sqlc.AddCaseEvidenceParams{
				CaseID:            c.ID,
				EvidenceType:      "canonical_property",
				SourceType:        "normalized_data",
				SourceReference:   draft.SourceReference,
				ExternalReference: pgtype.Text{String: draft.ExternalReference, Valid: draft.ExternalReference != ""},
				ExtractedFacts:    facts,
				EvidenceStatus:    string(cases.EvidenceStatusConfirmed),
				CreatedBy:         req.ActorID,
			})
			if err != nil {
				return cases.CaseDetail{}, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return cases.CaseDetail{}, err
	}

	return s.GetCaseDetail(ctx, uuidToString(c.ID))
}

func (s CasesStore) maybeAutoReopen(ctx context.Context, queries *sqlc.Queries, id pgtype.UUID, actorID string) error {
	c, err := queries.GetCaseRecord(ctx, id)
	if err != nil {
		return err
	}
	if c.Status == "resolved" || c.Status == "closed_unresolved" {
		_, err = queries.ReopenCase(ctx, id)
		if err != nil {
			return err
		}
		meta, _ := json.Marshal(map[string]any{"trigger": "auto_reopen"})
		_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
			CaseID:    id,
			ActorID:   actorID,
			EventType: cases.AuditCaseReopened,
			Metadata:  meta,
		})
		if err != nil {
			return err
		}
	}
	return nil
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

	if err := s.maybeAutoReopen(ctx, queries, id, req.ActorID); err != nil {
		return cases.CaseDetail{}, err
	}

	matchID, err := parseUUID(req.MatchID)
	if err != nil {
		return cases.CaseDetail{}, err
	}

	if req.Action == "confirm" {
		confirmed, err := queries.ConfirmCasePropertyMatch(ctx, sqlc.ConfirmCasePropertyMatchParams{
			CaseID:      id,
			ID:          matchID,
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

	if err := s.maybeAutoReopen(ctx, queries, id, req.ActorID); err != nil {
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

	if err := s.maybeAutoReopen(ctx, queries, id, req.ActorID); err != nil {
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

	if err := s.maybeAutoReopen(ctx, queries, id, req.ActorID); err != nil {
		return cases.CaseDetail{}, err
	}

	// Get current assignee before reassignment for audit
	current, err := queries.GetCaseRecord(ctx, id)
	if err != nil {
		return cases.CaseDetail{}, err
	}
	oldAssignee := current.AssigneeID

	c, err := queries.ReassignCase(ctx, sqlc.ReassignCaseParams{
		ID:         id,
		AssigneeID: req.AssigneeID,
	})
	if err != nil {
		return cases.CaseDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{"from": oldAssignee, "to": c.AssigneeID})
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
	if err := queries.SupersedeCurrentDecisions(ctx, id); err != nil {
		return cases.CaseDetail{}, err
	}

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
		if err := queries.AddDecisionReasonCode(ctx, sqlc.AddDecisionReasonCodeParams{
			DecisionID: dec.ID,
			ReasonCode: code,
		}); err != nil {
			return cases.CaseDetail{}, err
		}
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

func caseSummaryFromRecord(c any) cases.CaseSummary {
	switch r := c.(type) {
	case sqlc.OpsCaseRecord:
		return cases.CaseSummary{
			ID:                        uuidToString(r.ID),
			CaseReference:             r.CaseReference,
			PropertyDescription:       r.PropertyDescription,
			LocalityOrArea:            r.LocalityOrArea,
			MunicipalityOrDeedsOffice: r.MunicipalityOrDeedsOffice,
			TitleReference:            textToString(r.TitleReference),
			MatterReference:           textToString(r.MatterReference),
			Status:                    cases.CaseStatus(r.Status),
			AssigneeID:                r.AssigneeID,
			CreatedBy:                 r.CreatedBy,
			LinkedSeedPropertyID:      uuidToString(r.LinkedSeedPropertyID),
			LinkedPropertyID:          uuidToString(r.LinkedPropertyID),
			CreatedAt:                 r.CreatedAt.Time,
			UpdatedAt:                 r.UpdatedAt.Time,
		}
	case sqlc.GetCaseRecordRow:
		return cases.CaseSummary{
			ID:                        uuidToString(r.ID),
			CaseReference:             r.CaseReference,
			PropertyDescription:       r.PropertyDescription,
			LocalityOrArea:            r.LocalityOrArea,
			MunicipalityOrDeedsOffice: r.MunicipalityOrDeedsOffice,
			TitleReference:            textToString(r.TitleReference),
			MatterReference:           textToString(r.MatterReference),
			Status:                    cases.CaseStatus(r.Status),
			AssigneeID:                r.AssigneeID,
			CreatedBy:                 r.CreatedBy,
			LinkedSeedPropertyID:      uuidToString(r.LinkedSeedPropertyID),
			LinkedPropertyID:          uuidToString(r.LinkedPropertyID),
			CreatedAt:                 r.CreatedAt.Time,
			UpdatedAt:                 r.UpdatedAt.Time,
		}
	default:
		return cases.CaseSummary{}
	}
}

func propertyMatchesFromRows(rows []sqlc.OpsCasePropertyMatch) []cases.PropertyMatch {
	result := make([]cases.PropertyMatch, 0, len(rows))
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
	result := make([]cases.EvidenceItem, 0, len(rows))
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
	result := make([]cases.Party, 0, len(rows))
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
	result := make([]cases.AuditEvent, 0, len(rows))
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
