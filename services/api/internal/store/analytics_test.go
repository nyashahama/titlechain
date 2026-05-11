package store

import (
	"os"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

func TestAnalyticsOperatingSummaryFromRowMapsAllFields(t *testing.T) {
	got := analyticsOperatingSummaryFromRow(sqlc.GetAnalyticsOperatingSummaryRow{
		SubmittedCount:          9,
		ResolvedCount:           5,
		InReviewCount:           2,
		ReopenedCount:           1,
		UnresolvedCount:         3,
		AverageSecondsToResolve: 3600,
		OldestInReviewSeconds:   7200,
		AcceptedProposalCount:   4,
		ManualOverrideCount:     6,
	})

	if got.SubmittedCount != 9 {
		t.Fatalf("SubmittedCount = %d, want 9", got.SubmittedCount)
	}
	if got.ResolvedCount != 5 {
		t.Fatalf("ResolvedCount = %d, want 5", got.ResolvedCount)
	}
	if got.InReviewCount != 2 {
		t.Fatalf("InReviewCount = %d, want 2", got.InReviewCount)
	}
	if got.ReopenedCount != 1 {
		t.Fatalf("ReopenedCount = %d, want 1", got.ReopenedCount)
	}
	if got.UnresolvedCount != 3 {
		t.Fatalf("UnresolvedCount = %d, want 3", got.UnresolvedCount)
	}
	if got.AverageSecondsToResolve != 3600 {
		t.Fatalf("AverageSecondsToResolve = %d, want 3600", got.AverageSecondsToResolve)
	}
	if got.OldestInReviewSeconds != 7200 {
		t.Fatalf("OldestInReviewSeconds = %d, want 7200", got.OldestInReviewSeconds)
	}
	if got.AcceptedProposalCount != 4 {
		t.Fatalf("AcceptedProposalCount = %d, want 4", got.AcceptedProposalCount)
	}
	if got.ManualOverrideCount != 6 {
		t.Fatalf("ManualOverrideCount = %d, want 6", got.ManualOverrideCount)
	}
}

func TestAnalyticsRiskReasonsNilReturnsEmptySlice(t *testing.T) {
	got := analyticsRiskReasons(nil)

	if got == nil {
		t.Fatal("analyticsRiskReasons(nil) returned nil, want empty non-nil slice")
	}
	if len(got) != 0 {
		t.Fatalf("len = %d, want 0", len(got))
	}
}

func TestAnalyticsRiskReasonsPreservesValues(t *testing.T) {
	reasons := []string{"in_review", "conflicting_evidence"}

	got := analyticsRiskReasons(reasons)

	if !slices.Equal(got, reasons) {
		t.Fatalf("reasons = %#v, want %#v", got, reasons)
	}
}

func TestAnalyticsEvidenceFromRowsMapsNestedMixes(t *testing.T) {
	got := analyticsEvidenceFromRows(
		sqlc.GetAnalyticsEvidenceSummaryRow{
			TotalItems:                    8,
			CasesWithoutEvidence:          2,
			CasesWithoutConfirmedEvidence: 3,
		},
		[]sqlc.ListAnalyticsEvidenceStatusMixRow{
			{Status: "confirmed", Count: 5},
			{Status: "conflicting", Count: 1},
		},
		[]sqlc.ListAnalyticsEvidenceSourceTypeMixRow{
			{SourceType: "deeds_office", Count: 4},
			{SourceType: "municipal_account", Count: 2},
		},
	)

	if got.TotalItems != 8 {
		t.Fatalf("TotalItems = %d, want 8", got.TotalItems)
	}
	if got.CasesWithoutEvidence != 2 {
		t.Fatalf("CasesWithoutEvidence = %d, want 2", got.CasesWithoutEvidence)
	}
	if got.CasesWithoutConfirmedEvidence != 3 {
		t.Fatalf("CasesWithoutConfirmedEvidence = %d, want 3", got.CasesWithoutConfirmedEvidence)
	}
	if len(got.StatusMix) != 2 {
		t.Fatalf("len(StatusMix) = %d, want 2", len(got.StatusMix))
	}
	if got.StatusMix[1].Status != "conflicting" || got.StatusMix[1].Count != 1 {
		t.Fatalf("StatusMix[1] = %#v, want conflicting count 1", got.StatusMix[1])
	}
	if len(got.SourceTypeMix) != 2 {
		t.Fatalf("len(SourceTypeMix) = %d, want 2", len(got.SourceTypeMix))
	}
	if got.SourceTypeMix[0].SourceType != "deeds_office" || got.SourceTypeMix[0].Count != 4 {
		t.Fatalf("SourceTypeMix[0] = %#v, want deeds_office count 4", got.SourceTypeMix[0])
	}
}

func TestAnalyticsRiskQueueFromRowsMapsNestedReasons(t *testing.T) {
	got := analyticsRiskQueueFromRows([]sqlc.ListAnalyticsRiskQueueRow{
		{
			CaseID:           "case-1",
			CaseReference:    "TC-2026-0001",
			Status:           "in_review",
			CustomerStatus:   "in_review",
			OrganizationName: "Hama & Associates Inc",
			AgeSeconds:       86400,
			RiskReasons:      []string{"in_review", "no_confirmed_evidence"},
		},
	})

	if len(got) != 1 {
		t.Fatalf("len = %d, want 1", len(got))
	}
	if got[0].CaseID != "case-1" {
		t.Fatalf("CaseID = %q, want case-1", got[0].CaseID)
	}
	if got[0].OrganizationName != "Hama & Associates Inc" {
		t.Fatalf("OrganizationName = %q, want Hama & Associates Inc", got[0].OrganizationName)
	}
	if !slices.Equal(got[0].RiskReasons, []string{"in_review", "no_confirmed_evidence"}) {
		t.Fatalf("RiskReasons = %#v, want in_review/no_confirmed_evidence", got[0].RiskReasons)
	}
}

func TestAnalyticsSourceHealthFromRowMapsNullableSuccessfulRun(t *testing.T) {
	lastSuccess := time.Date(2026, 5, 12, 8, 30, 0, 0, time.UTC)

	got := analyticsSourceHealthFromRow(sqlc.GetAnalyticsSourceHealthRow{
		LatestRunID:            "run-1",
		LatestRunStatus:        "completed",
		LatestError:            "last error",
		FailedJobCount:         1,
		PendingJobCount:        2,
		QuarantinedRecordCount: 3,
		SourceLinkCount:        4,
		LastSuccessfulRunAt:    pgtype.Timestamptz{Time: lastSuccess, Valid: true},
	})

	if got.LatestRunID != "run-1" {
		t.Fatalf("LatestRunID = %q, want run-1", got.LatestRunID)
	}
	if got.LastSuccessfulRunAt == nil {
		t.Fatal("LastSuccessfulRunAt = nil, want value")
	}
	if !got.LastSuccessfulRunAt.Equal(lastSuccess) {
		t.Fatalf("LastSuccessfulRunAt = %s, want %s", got.LastSuccessfulRunAt, lastSuccess)
	}
}

func TestAnalyticsSQLScopesRelatedRowsAsOfWindow(t *testing.T) {
	sql := readNormalizedAnalyticsSQL(t)
	currentDecisions := sqlSection(t, sql, "current_decisions as (", ") select")

	assertSQLContains(t, currentDecisions, "join scoped_matters sm on sm.case_id = d.case_id")
	assertSQLContains(t, currentDecisions, "d.created_at < sqlc.arg('to_at')::timestamptz")
	if strings.Contains(currentDecisions, "d.created_at >= sqlc.narg('from_at')::timestamptz") {
		t.Fatal("current_decisions lower-bounds decision creation by from_at; decision source counts should follow scoped matters as-of to_at")
	}

	assertSQLContains(t, sql, "left join ops.case_evidence_items e on e.case_id = sc.id and e.created_at < sqlc.arg('to_at')::timestamptz")
	assertSQLContains(t, sql, "left join ops.case_decisions d on d.case_id = c.id and d.status = 'current' and d.created_at < sqlc.arg('to_at')::timestamptz")
	assertSQLContains(t, sql, "left join ops.case_evidence_items e on e.case_id = c.id and e.created_at < sqlc.arg('to_at')::timestamptz")
	assertSQLContains(t, sql, "exists ( select 1 from ops.case_evidence_items ce where ce.case_id = c.id and ce.evidence_status = 'conflicting' and ce.created_at < sqlc.arg('to_at')::timestamptz")
	assertSQLContains(t, sql, "not exists ( select 1 from ops.case_evidence_items ce where ce.case_id = c.id and ce.evidence_status = 'confirmed' and ce.created_at < sqlc.arg('to_at')::timestamptz")
}

func readNormalizedAnalyticsSQL(t *testing.T) string {
	t.Helper()

	contents, err := os.ReadFile("../../../../db/queries/analytics.sql")
	if err != nil {
		t.Fatalf("read analytics.sql: %v", err)
	}
	return strings.ToLower(strings.Join(strings.Fields(string(contents)), " "))
}

func sqlSection(t *testing.T, sql, start, end string) string {
	t.Helper()

	startIndex := strings.Index(sql, start)
	if startIndex == -1 {
		t.Fatalf("SQL section start %q not found", start)
	}
	sectionStart := startIndex + len(start)
	endIndex := strings.Index(sql[sectionStart:], end)
	if endIndex == -1 {
		t.Fatalf("SQL section end %q not found after %q", end, start)
	}
	return sql[sectionStart : sectionStart+endIndex]
}

func assertSQLContains(t *testing.T, sql, fragment string) {
	t.Helper()

	normalizedFragment := strings.ToLower(strings.Join(strings.Fields(fragment), " "))
	if !strings.Contains(sql, normalizedFragment) {
		t.Fatalf("SQL does not contain expected fragment:\n%s", fragment)
	}
}
