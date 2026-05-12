package store

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type AnalyticsStore struct {
	pool *pgxpool.Pool
}

var _ analytics.Repository = AnalyticsStore{}

func NewAnalyticsStore(pool *pgxpool.Pool) AnalyticsStore {
	return AnalyticsStore{pool: pool}
}

func (s AnalyticsStore) Overview(ctx context.Context, window analytics.Window) (analytics.Overview, error) {
	queries := sqlc.New(s.pool)
	from := nullableTimestamptz(window.From)
	to := pgtype.Timestamptz{Time: window.To, Valid: true}

	summary, err := queries.GetAnalyticsOperatingSummary(ctx, sqlc.GetAnalyticsOperatingSummaryParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	decisionMix, err := queries.ListAnalyticsDecisionMix(ctx, sqlc.ListAnalyticsDecisionMixParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	reasonCodes, err := queries.ListAnalyticsReasonCodes(ctx, sqlc.ListAnalyticsReasonCodesParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	evidenceSummary, err := queries.GetAnalyticsEvidenceSummary(ctx, sqlc.GetAnalyticsEvidenceSummaryParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	evidenceStatusMix, err := queries.ListAnalyticsEvidenceStatusMix(ctx, sqlc.ListAnalyticsEvidenceStatusMixParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	evidenceSourceMix, err := queries.ListAnalyticsEvidenceSourceTypeMix(ctx, sqlc.ListAnalyticsEvidenceSourceTypeMixParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	sourceHealth, err := queries.GetAnalyticsSourceHealth(ctx)
	if err != nil {
		return analytics.Overview{}, err
	}
	riskQueue, err := queries.ListAnalyticsRiskQueue(ctx, sqlc.ListAnalyticsRiskQueueParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}

	return analytics.Overview{
		Range: analytics.Range{
			Key:  window.Key,
			From: window.From,
			To:   window.To,
		},
		OperatingSummary: analyticsOperatingSummaryFromRow(summary),
		DecisionMix:      analyticsDecisionMixFromRows(decisionMix),
		ReasonCodes:      analyticsReasonCodesFromRows(reasonCodes),
		Evidence:         analyticsEvidenceFromRows(evidenceSummary, evidenceStatusMix, evidenceSourceMix),
		SourceHealth:     analyticsSourceHealthFromRow(sourceHealth),
		RiskQueue:        analyticsRiskQueueFromRows(riskQueue),
	}, nil
}

func nullableTimestamptz(value *time.Time) pgtype.Timestamptz {
	if value == nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: *value, Valid: true}
}

func analyticsOperatingSummaryFromRow(row sqlc.GetAnalyticsOperatingSummaryRow) analytics.OperatingSummary {
	return analytics.OperatingSummary{
		SubmittedCount:          int(row.SubmittedCount),
		ResolvedCount:           int(row.ResolvedCount),
		InReviewCount:           int(row.InReviewCount),
		ReopenedCount:           int(row.ReopenedCount),
		UnresolvedCount:         int(row.UnresolvedCount),
		AverageSecondsToResolve: int(row.AverageSecondsToResolve),
		OldestInReviewSeconds:   int(row.OldestInReviewSeconds),
		AcceptedProposalCount:   int(row.AcceptedProposalCount),
		ManualOverrideCount:     int(row.ManualOverrideCount),
	}
}

func analyticsDecisionMixFromRows(rows []sqlc.ListAnalyticsDecisionMixRow) []analytics.DecisionMetric {
	result := make([]analytics.DecisionMetric, 0, len(rows))
	for _, row := range rows {
		result = append(result, analytics.DecisionMetric{
			Decision:              row.Decision,
			Count:                 int(row.Count),
			ManualCount:           int(row.ManualCount),
			ManualOverrideCount:   int(row.ManualOverrideCount),
			AcceptedProposalCount: int(row.AcceptedProposalCount),
		})
	}
	return result
}

func analyticsReasonCodesFromRows(rows []sqlc.ListAnalyticsReasonCodesRow) []analytics.ReasonCodeMetric {
	result := make([]analytics.ReasonCodeMetric, 0, len(rows))
	for _, row := range rows {
		result = append(result, analytics.ReasonCodeMetric{
			Code:     row.Code,
			Label:    row.Label,
			Category: row.Category,
			Count:    int(row.Count),
		})
	}
	return result
}

func analyticsEvidenceFromRows(
	summary sqlc.GetAnalyticsEvidenceSummaryRow,
	statusRows []sqlc.ListAnalyticsEvidenceStatusMixRow,
	sourceRows []sqlc.ListAnalyticsEvidenceSourceTypeMixRow,
) analytics.EvidenceAnalytics {
	statusMix := make([]analytics.EvidenceStatusMetric, 0, len(statusRows))
	for _, row := range statusRows {
		statusMix = append(statusMix, analytics.EvidenceStatusMetric{
			Status: row.Status,
			Count:  int(row.Count),
		})
	}

	sourceMix := make([]analytics.EvidenceSourceMetric, 0, len(sourceRows))
	for _, row := range sourceRows {
		sourceMix = append(sourceMix, analytics.EvidenceSourceMetric{
			SourceType: row.SourceType,
			Count:      int(row.Count),
		})
	}

	return analytics.EvidenceAnalytics{
		TotalItems:                    int(summary.TotalItems),
		CasesWithoutEvidence:          int(summary.CasesWithoutEvidence),
		CasesWithoutConfirmedEvidence: int(summary.CasesWithoutConfirmedEvidence),
		ExceptionApprovedCount:        int(summary.ExceptionApprovedCount),
		StatusMix:                     statusMix,
		SourceTypeMix:                 sourceMix,
	}
}

func analyticsSourceHealthFromRow(row sqlc.GetAnalyticsSourceHealthRow) analytics.SourceHealth {
	return analytics.SourceHealth{
		LatestRunID:            row.LatestRunID,
		LatestRunStatus:        row.LatestRunStatus,
		LatestError:            row.LatestError,
		FailedJobCount:         int(row.FailedJobCount),
		PendingJobCount:        int(row.PendingJobCount),
		QuarantinedRecordCount: int(row.QuarantinedRecordCount),
		SourceLinkCount:        int(row.SourceLinkCount),
		LastSuccessfulRunAt:    pgTimePtr(row.LastSuccessfulRunAt),
	}
}

func analyticsRiskQueueFromRows(rows []sqlc.ListAnalyticsRiskQueueRow) []analytics.RiskQueueItem {
	result := make([]analytics.RiskQueueItem, 0, len(rows))
	for _, row := range rows {
		result = append(result, analytics.RiskQueueItem{
			CaseID:           row.CaseID,
			CaseReference:    row.CaseReference,
			Status:           row.Status,
			CustomerStatus:   row.CustomerStatus,
			OrganizationName: row.OrganizationName,
			AgeSeconds:       int(row.AgeSeconds),
			RiskReasons:      analyticsRiskReasons(row.RiskReasons),
		})
	}
	return result
}

func analyticsRiskReasons(reasons []string) []string {
	if reasons == nil {
		return []string{}
	}
	return reasons
}

func pgTimePtr(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}
	t := value.Time
	return &t
}
