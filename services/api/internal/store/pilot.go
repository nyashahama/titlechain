package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type PilotStore struct {
	pool *pgxpool.Pool
}

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

func (s PilotStore) CreateMatter(ctx context.Context, user pilot.User, req pilot.CreateMatterRequest) (pilot.MatterSummary, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return pilot.MatterSummary{}, err
	}
	defer tx.Rollback(ctx)

	queries := sqlc.New(s.pool).WithTx(tx)

	caseReference := fmt.Sprintf("TC-%d", time.Now().UnixNano())
	userUUID, _ := parseUUID(user.ID)
	orgUUID, _ := parseUUID(user.Organization.ID)

	c, err := queries.CreateCaseRecord(ctx, sqlc.CreateCaseRecordParams{
		CaseReference:             caseReference,
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
		TitleReference:            pgtype.Text{String: req.TitleReference, Valid: req.TitleReference != ""},
		MatterReference:           pgtype.Text{String: req.CustomerReference, Valid: req.CustomerReference != ""},
		IntakeNote:                pgtype.Text{String: req.IntakeNote, Valid: req.IntakeNote != ""},
		AssigneeID:                "ana-001",
		LinkedPropertyID:          pgtype.UUID{},
	})
	if err != nil {
		return pilot.MatterSummary{}, err
	}

	meta, _ := json.Marshal(map[string]any{
		"case_reference":   caseReference,
		"pilot_user_id":    user.ID,
		"organization_id":  user.Organization.ID,
		"pilot_submission": true,
	})
	_, err = queries.CreateCaseAuditEvent(ctx, sqlc.CreateCaseAuditEventParams{
		CaseID:    c.ID,
		ActorID:   "ana-001",
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

	if err := tx.Commit(ctx); err != nil {
		return pilot.MatterSummary{}, err
	}

	return pilot.MatterSummary{
		ID:                         uuidToString(ml.ID),
		CaseID:                     uuidToString(ml.CaseID),
		CaseReference:              caseReference,
		CustomerReference:          textToString(ml.CustomerReference),
		CustomerStatus:             ml.CustomerStatus,
		PropertyDescription:        req.PropertyDescription,
		LocalityOrArea:             req.LocalityOrArea,
		MunicipalityOrDeedsOffice:  req.MunicipalityOrDeedsOffice,
		TitleReference:             req.TitleReference,
		SubmittedAt:                ml.SubmittedAt.Time,
		UpdatedAt:                  ml.UpdatedAt.Time,
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
			ID:                         uuidToString(row.MatterID),
			CaseID:                     uuidToString(row.CaseID),
			CaseReference:              row.CaseReference,
			CustomerReference:          textToString(row.CustomerReference),
			CustomerStatus:             row.CustomerStatus,
			PropertyDescription:        row.PropertyDescription,
			LocalityOrArea:             row.LocalityOrArea,
			MunicipalityOrDeedsOffice:  row.MunicipalityOrDeedsOffice,
			TitleReference:             textToString(row.TitleReference),
			Decision:                   textToString(row.CurrentDecision),
			SubmittedAt:                row.SubmittedAt.Time,
			UpdatedAt:                  row.UpdatedAt.Time,
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

	caseUUID := ml.CaseID
	caseRow, err := queries.GetCaseRecord(ctx, caseUUID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}

	decisions, err := queries.ListCaseDecisions(ctx, caseUUID)
	if err != nil {
		return pilot.MatterDetail{}, err
	}
	var decision string
	var reasons []pilot.VisibleReason
	for _, d := range decisions {
		if d.Status == "current" {
			decision = d.Decision
			codes, err := queries.ListDecisionReasonCodes(ctx, d.ID)
			if err == nil {
				for _, rc := range codes {
					reasons = append(reasons, pilot.VisibleReason{
						Code:  rc.Code,
						Label: rc.Label,
					})
				}
			}
			break
		}
	}

	evidenceRows, err := queries.ListCaseEvidence(ctx, caseUUID)
	var evidence []pilot.VisibleEvidence
	if err == nil {
		for _, e := range evidenceRows {
			evidence = append(evidence, pilot.VisibleEvidence{
				Type:            e.EvidenceType,
				SourceType:      e.SourceType,
				SourceReference: e.SourceReference,
				Excerpt:         textToString(e.Excerpt),
				Status:          e.EvidenceStatus,
			})
		}
	}

	auditRows, err := queries.ListCaseAuditEvents(ctx, caseUUID)
	var timeline []pilot.VisibleTimelineEvent
	if err == nil {
		for _, a := range auditRows {
			timeline = append(timeline, pilot.VisibleTimelineEvent{
				Type:      a.EventType,
				Label:     a.EventType,
				CreatedAt: a.CreatedAt.Time,
			})
		}
	}

	summary := pilot.MatterSummary{
		ID:                         uuidToString(ml.ID),
		CaseID:                     uuidToString(ml.CaseID),
		CaseReference:              caseRow.CaseReference,
		CustomerReference:          textToString(ml.CustomerReference),
		CustomerStatus:             ml.CustomerStatus,
		PropertyDescription:        caseRow.PropertyDescription,
		LocalityOrArea:             caseRow.LocalityOrArea,
		MunicipalityOrDeedsOffice:  caseRow.MunicipalityOrDeedsOffice,
		TitleReference:             textToString(caseRow.TitleReference),
		Decision:                   decision,
		SubmittedAt:                ml.SubmittedAt.Time,
		UpdatedAt:                  ml.UpdatedAt.Time,
	}

	return pilot.MatterDetail{
		Summary:  summary,
		Evidence: evidence,
		Reasons:  reasons,
		Timeline: timeline,
	}, nil
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
	userUUID, _ := parseUUID(user.ID)

	queries := sqlc.New(s.pool)
	_, err = queries.CreatePilotSummaryExport(ctx, sqlc.CreatePilotSummaryExportParams{
		MatterLinkID:       matterUUID,
		RequestedByUserID:  userUUID,
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
