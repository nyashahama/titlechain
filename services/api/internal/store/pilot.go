package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type PilotStore struct {
	pool *pgxpool.Pool
}

const pilotMatterActorID = "ana-001"

var _ pilot.Repository = PilotStore{}

func NewPilotStore(pool *pgxpool.Pool) PilotStore {
	return PilotStore{pool: pool}
}

func (s PilotStore) FindUserByEmail(ctx context.Context, email string) (pilot.UserRecord, error) {
	row, err := sqlc.New(s.pool).GetPilotUserByEmail(ctx, email)
	if err != nil {
		return pilot.UserRecord{}, err
	}
	return pilotUserRecordFromEmailRow(row), nil
}

func (s PilotStore) FindUserBySessionTokenHash(ctx context.Context, tokenHash string) (pilot.UserRecord, error) {
	row, err := sqlc.New(s.pool).GetPilotUserBySessionTokenHash(ctx, tokenHash)
	if err != nil {
		return pilot.UserRecord{}, err
	}
	return pilotUserRecordFromSessionRow(row), nil
}

func (s PilotStore) CreateSession(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	userUUID, err := parseUUID(userID)
	if err != nil {
		return err
	}
	_, err = sqlc.New(s.pool).CreatePilotSession(ctx, sqlc.CreatePilotSessionParams{
		UserID:    userUUID,
		TokenHash: tokenHash,
		ExpiresAt: timestamptz(expiresAt),
	})
	return err
}

func (s PilotStore) RevokeSession(ctx context.Context, tokenHash string) error {
	return sqlc.New(s.pool).RevokePilotSession(ctx, tokenHash)
}

func selectSourceBackedPropertyCandidate(req pilot.CreateMatterRequest, candidates []sqlc.FindPropertySummaryCandidatesRow) (pgtype.UUID, bool) {
	var selected pgtype.UUID
	qualifyingCount := 0
	for _, candidate := range candidates {
		if !propertyCandidateQualifiesForAutoLink(req, candidate) {
			continue
		}
		qualifyingCount++
		selected = candidate.PropertyID
	}

	if qualifyingCount != 1 {
		return pgtype.UUID{}, false
	}
	return selected, true
}

func propertyCandidateQualifiesForAutoLink(req pilot.CreateMatterRequest, candidate sqlc.FindPropertySummaryCandidatesRow) bool {
	if !candidate.PropertyID.Valid || candidate.ConfidenceScore < 85 || candidate.SourceProvenanceCount < 1 {
		return false
	}
	if candidate.ConfidenceScore == 100 {
		return true
	}
	return submittedContextCompatible(req.LocalityOrArea, candidate.LocalityOrArea) &&
		submittedContextCompatible(req.MunicipalityOrDeedsOffice, candidate.MunicipalityOrDeedsOffice)
}

func submittedContextCompatible(submitted, candidate string) bool {
	submitted = strings.TrimSpace(submitted)
	candidate = strings.TrimSpace(candidate)
	if submitted == "" || candidate == "" {
		return true
	}
	return strings.EqualFold(submitted, candidate)
}

func (s PilotStore) CreateMatter(ctx context.Context, user pilot.User, req pilot.CreateMatterRequest) (pilot.MatterSummary, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return pilot.MatterSummary{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)

	caseReference := fmt.Sprintf("TC-%d", time.Now().UnixNano())
	userUUID, err := parseUUID(user.ID)
	if err != nil {
		return pilot.MatterSummary{}, err
	}
	orgUUID, err := parseUUID(user.Organization.ID)
	if err != nil {
		return pilot.MatterSummary{}, err
	}

	candidates, err := queries.FindPropertySummaryCandidates(ctx, sqlc.FindPropertySummaryCandidatesParams{
		TitleReference:            req.TitleReference,
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
	})
	if err != nil {
		return pilot.MatterSummary{}, err
	}
	linkedPropID, autoLinked := selectSourceBackedPropertyCandidate(req, candidates)

	c, err := queries.CreateCaseRecord(ctx, sqlc.CreateCaseRecordParams{
		CaseReference:             caseReference,
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
		TitleReference:            pgtype.Text{String: req.TitleReference, Valid: req.TitleReference != ""},
		MatterReference:           pgtype.Text{String: req.CustomerReference, Valid: req.CustomerReference != ""},
		IntakeNote:                pgtype.Text{String: req.IntakeNote, Valid: req.IntakeNote != ""},
		AssigneeID:                pilotMatterActorID,
		LinkedPropertyID:          linkedPropID,
	})
	if err != nil {
		return pilot.MatterSummary{}, err
	}

	caseStore := CasesStore{pool: s.pool}
	if autoLinked {
		if err := caseStore.attachCanonicalEvidenceForLinkedPropertyInTx(ctx, queries, c.ID, uuidToString(linkedPropID), pilotMatterActorID); err != nil {
			return pilot.MatterSummary{}, err
		}
	}

	meta, _ := json.Marshal(map[string]any{
		"case_reference":   caseReference,
		"pilot_user_id":    user.ID,
		"organization_id":  user.Organization.ID,
		"pilot_submission": true,
	})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    c.ID,
		ActorID:   pilotMatterActorID,
		EventType: "case_created",
		Metadata:  meta,
	})
	if err != nil {
		return pilot.MatterSummary{}, err
	}

	ml, err := queries.CreatePilotMatterLink(ctx, sqlc.CreatePilotMatterLinkParams{
		OrganizationID:    orgUUID,
		CreatedByUserID:   userUUID,
		CaseID:            c.ID,
		CustomerReference: pgtype.Text{String: req.CustomerReference, Valid: req.CustomerReference != ""},
	})
	if err != nil {
		return pilot.MatterSummary{}, err
	}

	if _, err := caseStore.reevaluateCaseInTx(ctx, queries, c.ID); err != nil {
		return pilot.MatterSummary{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return pilot.MatterSummary{}, err
	}

	return pilot.MatterSummary{
		ID:                        uuidToString(ml.ID),
		CaseID:                    uuidToString(ml.CaseID),
		CaseReference:             caseReference,
		CustomerReference:         textToString(ml.CustomerReference),
		CustomerStatus:            ml.CustomerStatus,
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
		TitleReference:            req.TitleReference,
		SubmittedAt:               ml.SubmittedAt.Time,
		UpdatedAt:                 ml.UpdatedAt.Time,
	}, nil
}

func (s PilotStore) ListMatters(ctx context.Context, user pilot.User, status string, limit int) ([]pilot.MatterSummary, error) {
	orgUUID, err := parseUUID(user.Organization.ID)
	if err != nil {
		return nil, err
	}

	rows, err := sqlc.New(s.pool).ListPilotMatterSummaries(ctx, sqlc.ListPilotMatterSummariesParams{
		OrganizationID: orgUUID,
		Limit:          int32(limit),
		CustomerStatus: pgtype.Text{String: status, Valid: status != ""},
	})
	if err != nil {
		return nil, err
	}

	summaries := make([]pilot.MatterSummary, 0, len(rows))
	for _, row := range rows {
		s := pilot.MatterSummary{
			ID:                        uuidToString(row.MatterID),
			CaseID:                    uuidToString(row.CaseID),
			CaseReference:             row.CaseReference,
			CustomerReference:         textToString(row.CustomerReference),
			CustomerStatus:            row.CustomerStatus,
			PropertyDescription:       row.PropertyDescription,
			LocalityOrArea:            row.LocalityOrArea,
			MunicipalityOrDeedsOffice: row.MunicipalityOrDeedsOffice,
			TitleReference:            textToString(row.TitleReference),
			Decision:                  textToString(row.CurrentDecision),
			SubmittedAt:               row.SubmittedAt.Time,
			UpdatedAt:                 row.UpdatedAt.Time,
		}
		summaries = append(summaries, s)
	}
	return summaries, nil
}

func (s PilotStore) GetMatterDetail(ctx context.Context, user pilot.User, matterID string) (pilot.MatterDetail, error) {
	orgUUID, _ := parseUUID(user.Organization.ID)
	matterUUID, err := parseUUID(matterID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	queries := sqlc.New(s.pool)

	touchErr := queries.TouchPilotMatterViewed(ctx, sqlc.TouchPilotMatterViewedParams{
		ID:             matterUUID,
		OrganizationID: orgUUID,
	})
	_ = touchErr

	ml, err := queries.GetPilotMatterLinkForOrg(ctx, sqlc.GetPilotMatterLinkForOrgParams{
		ID:             matterUUID,
		OrganizationID: orgUUID,
	})
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	caseStore := CasesStore{pool: s.pool}
	caseDetail, err := caseStore.buildCaseDetail(ctx, queries, ml.CaseID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	var decision string
	var reasons []pilot.VisibleReason
	for _, d := range caseDetail.Decisions {
		if d.Status == "current" {
			decision = string(d.Decision)
			for _, rc := range d.ReasonCodes {
				reasons = append(reasons, pilot.VisibleReason{
					Code:  rc.Code,
					Label: rc.Label,
				})
			}
			break
		}
	}

	evidence := make([]pilot.VisibleEvidence, 0, len(caseDetail.Evidence))
	for _, e := range caseDetail.Evidence {
		evidence = append(evidence, pilot.VisibleEvidence{
			Type:            e.EvidenceType,
			SourceType:      e.SourceType,
			SourceReference: e.SourceReference,
			Excerpt:         e.Excerpt,
			Status:          string(e.EvidenceStatus),
		})
	}

	timeline := make([]pilot.VisibleTimelineEvent, 0, len(caseDetail.AuditEvents))
	for _, a := range caseDetail.AuditEvents {
		timeline = append(timeline, pilot.VisibleTimelineEvent{
			Type:      a.EventType,
			Label:     pilotTimelineLabel(a.EventType),
			CreatedAt: a.CreatedAt,
		})
	}

	summary := pilot.MatterSummary{
		ID:                        uuidToString(ml.ID),
		CaseID:                    uuidToString(ml.CaseID),
		CaseReference:             caseDetail.Case.CaseReference,
		CustomerReference:         textToString(ml.CustomerReference),
		CustomerStatus:            ml.CustomerStatus,
		PropertyDescription:       caseDetail.Case.PropertyDescription,
		LocalityOrArea:            caseDetail.Case.LocalityOrArea,
		MunicipalityOrDeedsOffice: caseDetail.Case.MunicipalityOrDeedsOffice,
		TitleReference:            caseDetail.Case.TitleReference,
		Decision:                  decision,
		SubmittedAt:               ml.SubmittedAt.Time,
		UpdatedAt:                 ml.UpdatedAt.Time,
	}

	return pilot.MatterDetail{
		Summary:           summary,
		EvidenceReadiness: pilotEvidenceReadinessSummary(caseDetail.EvidenceReadiness),
		Evidence:          evidence,
		Reasons:           reasons,
		Timeline:          timeline,
	}, nil
}

func pilotTimelineLabel(eventType string) string {
	switch eventType {
	case "case_created":
		return "Matter received"
	case "evidence_added":
		return "Evidence added"
	case "decision_recorded":
		return "Decision published"
	case "case_reopened", "reopened":
		return "Matter reopened"
	case "property_match_confirmed":
		return "Property source matched"
	default:
		return strings.ReplaceAll(eventType, "_", " ")
	}
}

func pilotEvidenceReadinessSummary(readiness cases.EvidenceReadinessSummary) pilot.EvidenceReadinessSummary {
	return pilot.EvidenceReadinessSummary{
		State:                  string(readiness.State),
		Label:                  readiness.Label,
		Description:            readiness.Description,
		ConfirmedEvidenceCount: readiness.ConfirmedEvidenceCount,
		EvidenceCount:          readiness.EvidenceCount,
		Missing:                append([]string{}, readiness.Missing...),
	}
}

func (s PilotStore) ReopenMatter(ctx context.Context, user pilot.User, matterID string, req pilot.ReopenMatterRequest) (pilot.MatterDetail, error) {
	orgUUID, _ := parseUUID(user.Organization.ID)
	matterUUID, err := parseUUID(matterID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	queries := sqlc.New(s.pool)
	ml, err := queries.GetPilotMatterLinkForOrg(ctx, sqlc.GetPilotMatterLinkForOrgParams{
		ID:             matterUUID,
		OrganizationID: orgUUID,
	})
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	if ml.CustomerStatus != "resolved" {
		return pilot.MatterDetail{}, errors.New("only resolved matters can be reopened")
	}

	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return pilot.MatterDetail{}, err
	}
	defer tx.Rollback(ctx)

	txQueries := sqlc.New(s.pool).WithTx(tx)

	_, err = txQueries.ReopenCase(ctx, ml.CaseID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	meta, _ := json.Marshal(map[string]any{
		"reopen_note":   req.Note,
		"pilot_user_id": user.ID,
	})
	_, err = txQueries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    ml.CaseID,
		ActorID:   "ana-001",
		EventType: "reopened",
		Metadata:  meta,
	})
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	err = txQueries.UpdatePilotMatterStatusByCase(ctx, sqlc.UpdatePilotMatterStatusByCaseParams{
		CaseID:         ml.CaseID,
		CustomerStatus: "reopened",
	})
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return pilot.MatterDetail{}, err
	}

	return s.GetMatterDetail(ctx, user, matterID)
}

func (s PilotStore) CreateSummaryExport(ctx context.Context, user pilot.User, matterID string) (pilot.SummaryExport, error) {
	matterUUID, err := parseUUID(matterID)
	if err != nil {
		return pilot.SummaryExport{}, err
	}
	orgUUID, err := parseUUID(user.Organization.ID)
	if err != nil {
		return pilot.SummaryExport{}, err
	}
	userUUID, err := parseUUID(user.ID)
	if err != nil {
		return pilot.SummaryExport{}, err
	}

	queries := sqlc.New(s.pool)
	ml, err := queries.GetPilotMatterLinkForOrg(ctx, sqlc.GetPilotMatterLinkForOrgParams{
		ID:             matterUUID,
		OrganizationID: orgUUID,
	})
	if err != nil {
		return pilot.SummaryExport{}, err
	}
	_, err = queries.CreatePilotSummaryExport(ctx, sqlc.CreatePilotSummaryExportParams{
		MatterLinkID:      ml.ID,
		RequestedByUserID: userUUID,
	})
	if err != nil {
		return pilot.SummaryExport{}, err
	}

	detail, err := s.GetMatterDetail(ctx, user, matterID)
	if err != nil {
		return pilot.SummaryExport{}, err
	}

	return pilot.SummaryExport{
		Matter:      detail,
		GeneratedAt: time.Now(),
		Disclaimer:  "TitleChain provides verification support, not legal advice or a deeds-office guarantee.",
	}, nil
}

func (s PilotStore) GetMetrics(ctx context.Context) (pilot.Metrics, error) {
	row, err := sqlc.New(s.pool).GetPilotMetrics(ctx)
	if err != nil {
		return pilot.Metrics{}, err
	}
	return pilot.Metrics{
		SubmittedCount:          int(row.SubmittedCount),
		ResolvedCount:           int(row.ResolvedCount),
		ReopenedCount:           int(row.ReopenedCount),
		InReviewCount:           int(row.InReviewCount),
		UnresolvedCount:         int(row.UnresolvedCount),
		AverageSecondsToResolve: int(row.AvgSecondsToResolve),
		OldestInReviewSeconds:   int(row.OldestInReviewSeconds),
		AcceptedProposalCount:   int(row.AcceptedProposalCount),
		ManualOverrideCount:     int(row.ManualOverrideCount),
	}, nil
}

func timestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: !t.IsZero()}
}

func pilotUserRecordFromEmailRow(row sqlc.GetPilotUserByEmailRow) pilot.UserRecord {
	return pilot.UserRecord{
		User:         userRecordFromRow(row.ID, row.OrganizationID, row.Email, row.DisplayName, row.Role, row.Active, row.OrganizationName, row.OrganizationSlug, row.OrganizationStatus),
		PasswordHash: row.PasswordHash,
	}
}

func pilotUserRecordFromSessionRow(row sqlc.GetPilotUserBySessionTokenHashRow) pilot.UserRecord {
	return pilot.UserRecord{
		User:         userRecordFromRow(row.ID, row.OrganizationID, row.Email, row.DisplayName, row.Role, row.Active, row.OrganizationName, row.OrganizationSlug, row.OrganizationStatus),
		PasswordHash: row.PasswordHash,
	}
}

func userRecordFromRow(id, orgID pgtype.UUID, email, displayName, role string, active bool, orgName, orgSlug, orgStatus string) pilot.User {
	return pilot.User{
		ID:           uuidToString(id),
		Organization: pilot.Organization{ID: uuidToString(orgID), Name: orgName, Slug: orgSlug, Status: orgStatus},
		Email:        email,
		DisplayName:  displayName,
		Role:         role,
		Active:       active,
	}
}

func customerStatusFromCaseStatus(status string) string {
	switch status {
	case "in_review":
		return "in_review"
	case "resolved", "closed_unresolved":
		return "resolved"
	case "reopened":
		return "reopened"
	default:
		return "submitted"
	}
}

func syncPilotStatusInTx(ctx context.Context, queries *sqlc.Queries, caseID pgtype.UUID, caseStatus string) {
	_ = queries.UpdatePilotMatterStatusByCase(ctx, sqlc.UpdatePilotMatterStatusByCaseParams{
		CaseID:         caseID,
		CustomerStatus: customerStatusFromCaseStatus(caseStatus),
	})
}
