package analytics

import (
	"context"
	"testing"
	"time"
)

func TestNormalizeRangeDefaultsToThirtyDays(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.FixedZone("SAST", 2*60*60))
	wantTo := now.UTC()

	window, err := NormalizeRange("", now)

	if err != nil {
		t.Fatalf("NormalizeRange returned error: %v", err)
	}
	if window.Key != RangeThirtyDays {
		t.Fatalf("key = %q, want %q", window.Key, RangeThirtyDays)
	}
	if window.From == nil {
		t.Fatal("from = nil, want thirty day start")
	}
	if got := window.From.UTC(); !got.Equal(wantTo.AddDate(0, 0, -30)) {
		t.Fatalf("from = %s, want %s", got, wantTo.AddDate(0, 0, -30))
	}
	if !window.To.Equal(wantTo) {
		t.Fatalf("to = %s, want %s", window.To, wantTo)
	}
}

func TestNormalizeRangeSupportsAll(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.FixedZone("SAST", 2*60*60))
	wantTo := now.UTC()

	window, err := NormalizeRange(RangeAll, now)

	if err != nil {
		t.Fatalf("NormalizeRange returned error: %v", err)
	}
	if window.Key != RangeAll {
		t.Fatalf("key = %q, want %q", window.Key, RangeAll)
	}
	if window.From != nil {
		t.Fatalf("from = %s, want nil", window.From)
	}
	if !window.To.Equal(wantTo) {
		t.Fatalf("to = %s, want %s", window.To, wantTo)
	}
}

func TestNormalizeRangeRejectsUnknownRange(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC)

	_, err := NormalizeRange("365d", now)

	if err == nil {
		t.Fatal("err = nil, want unsupported range error")
	}
}

func TestServicePassesNormalizedRangeToRepository(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC)
	repo := NewMemoryRepository()
	service := NewService(repo)
	service.now = func() time.Time { return now }

	overview, err := service.GetOverview(context.Background(), RangeSevenDays)

	if err != nil {
		t.Fatalf("GetOverview returned error: %v", err)
	}
	if overview.Range.Key != RangeSevenDays {
		t.Fatalf("range key = %q, want %q", overview.Range.Key, RangeSevenDays)
	}
	if overview.Range.From == nil {
		t.Fatal("range from = nil, want seven day start")
	}
	if got := overview.Range.From.UTC(); !got.Equal(now.AddDate(0, 0, -7)) {
		t.Fatalf("range from = %s, want %s", got, now.AddDate(0, 0, -7))
	}
	if !overview.Range.To.Equal(now) {
		t.Fatalf("range to = %s, want %s", overview.Range.To, now)
	}
	if repo.LastWindow().Key != RangeSevenDays {
		t.Fatalf("repository window key = %q, want %q", repo.LastWindow().Key, RangeSevenDays)
	}
	if repo.LastWindow().From == nil {
		t.Fatal("repository window from = nil, want seven day start")
	}
	if got := repo.LastWindow().From.UTC(); !got.Equal(now.AddDate(0, 0, -7)) {
		t.Fatalf("repository window from = %s, want %s", got, now.AddDate(0, 0, -7))
	}
	if !repo.LastWindow().To.Equal(now) {
		t.Fatalf("repository window to = %s, want %s", repo.LastWindow().To, now)
	}
}

func TestMemoryRepositorySetOverviewCopiesMutableFields(t *testing.T) {
	repo := NewMemoryRepository()
	overview := mutableOverview()

	repo.SetOverview(overview)

	mutateOverview(&overview)
	got, err := repo.Overview(context.Background(), Window{})

	if err != nil {
		t.Fatalf("Overview returned error: %v", err)
	}
	assertMutableOverviewUnchanged(t, got)
}

func TestMemoryRepositoryOverviewReturnsCopy(t *testing.T) {
	repo := NewMemoryRepository()
	repo.SetOverview(mutableOverview())

	got, err := repo.Overview(context.Background(), Window{})
	if err != nil {
		t.Fatalf("Overview returned error: %v", err)
	}
	mutateOverview(&got)

	next, err := repo.Overview(context.Background(), Window{})
	if err != nil {
		t.Fatalf("Overview returned error: %v", err)
	}
	assertMutableOverviewUnchanged(t, next)
}

func TestMemoryRepositoryLastWindowReturnsCopy(t *testing.T) {
	repo := NewMemoryRepository()
	from := time.Date(2026, 5, 5, 10, 30, 0, 0, time.UTC)
	wantFrom := from
	window := Window{
		Key:  RangeSevenDays,
		From: &from,
		To:   time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC),
	}

	_, err := repo.Overview(context.Background(), window)
	if err != nil {
		t.Fatalf("Overview returned error: %v", err)
	}
	*window.From = window.From.AddDate(0, 0, -1)
	got := repo.LastWindow()
	if got.From == nil {
		t.Fatal("window from = nil, want stored from")
	}
	*got.From = got.From.AddDate(0, 0, -1)

	next := repo.LastWindow()
	if next.From == nil {
		t.Fatal("window from = nil, want stored from")
	}
	if !next.From.Equal(wantFrom) {
		t.Fatalf("window from = %s, want %s", next.From, wantFrom)
	}
}

func mutableOverview() Overview {
	rangeFrom := time.Date(2026, 5, 5, 10, 30, 0, 0, time.UTC)
	lastSuccessfulRunAt := time.Date(2026, 5, 12, 8, 30, 0, 0, time.UTC)
	return Overview{
		Range: Range{
			Key:  RangeSevenDays,
			From: &rangeFrom,
			To:   time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC),
		},
		DecisionMix: []DecisionMetric{
			{Decision: "clear", Count: 2},
		},
		ReasonCodes: []ReasonCodeMetric{
			{Code: "title_clean", Label: "Title clean", Category: "review", Count: 1},
		},
		Evidence: EvidenceAnalytics{
			TotalItems:                    6,
			CasesWithoutEvidence:          1,
			CasesWithoutConfirmedEvidence: 2,
			ExceptionApprovedCount:        1,
			StatusMix: []EvidenceStatusMetric{
				{Status: "confirmed", Count: 3},
			},
			SourceTypeMix: []EvidenceSourceMetric{
				{SourceType: "deeds_office", Count: 3},
			},
		},
		SourceHealth: SourceHealth{
			LatestRunStatus:     "completed",
			LastSuccessfulRunAt: &lastSuccessfulRunAt,
		},
		RiskQueue: []RiskQueueItem{
			{
				CaseID:      "case-1",
				RiskReasons: []string{"conflicting_evidence"},
			},
		},
	}
}

func mutateOverview(overview *Overview) {
	*overview.Range.From = overview.Range.From.AddDate(0, 0, -1)
	overview.DecisionMix[0].Decision = "stop"
	overview.ReasonCodes[0].Code = "changed"
	overview.Evidence.StatusMix[0].Status = "conflicting"
	overview.Evidence.SourceTypeMix[0].SourceType = "manual"
	*overview.SourceHealth.LastSuccessfulRunAt = overview.SourceHealth.LastSuccessfulRunAt.AddDate(0, 0, -1)
	overview.RiskQueue[0].CaseID = "changed-case"
	overview.RiskQueue[0].RiskReasons[0] = "changed_reason"
}

func assertMutableOverviewUnchanged(t *testing.T, overview Overview) {
	t.Helper()

	wantFrom := time.Date(2026, 5, 5, 10, 30, 0, 0, time.UTC)
	if overview.Range.From == nil {
		t.Fatal("range from = nil, want copied from")
	}
	if !overview.Range.From.Equal(wantFrom) {
		t.Fatalf("range from = %s, want %s", overview.Range.From, wantFrom)
	}
	if overview.DecisionMix[0].Decision != "clear" {
		t.Fatalf("decision = %q, want clear", overview.DecisionMix[0].Decision)
	}
	if overview.ReasonCodes[0].Code != "title_clean" {
		t.Fatalf("reason code = %q, want title_clean", overview.ReasonCodes[0].Code)
	}
	if overview.Evidence.StatusMix[0].Status != "confirmed" {
		t.Fatalf("evidence status = %q, want confirmed", overview.Evidence.StatusMix[0].Status)
	}
	if overview.Evidence.SourceTypeMix[0].SourceType != "deeds_office" {
		t.Fatalf("source type = %q, want deeds_office", overview.Evidence.SourceTypeMix[0].SourceType)
	}
	if overview.Evidence.ExceptionApprovedCount != 1 {
		t.Fatalf("exception approved count = %d, want 1", overview.Evidence.ExceptionApprovedCount)
	}

	wantLastSuccess := time.Date(2026, 5, 12, 8, 30, 0, 0, time.UTC)
	if overview.SourceHealth.LastSuccessfulRunAt == nil {
		t.Fatal("last successful run at = nil, want copied time")
	}
	if !overview.SourceHealth.LastSuccessfulRunAt.Equal(wantLastSuccess) {
		t.Fatalf("last successful run at = %s, want %s", overview.SourceHealth.LastSuccessfulRunAt, wantLastSuccess)
	}
	if overview.RiskQueue[0].CaseID != "case-1" {
		t.Fatalf("risk queue case id = %q, want case-1", overview.RiskQueue[0].CaseID)
	}
	if overview.RiskQueue[0].RiskReasons[0] != "conflicting_evidence" {
		t.Fatalf("risk reason = %q, want conflicting_evidence", overview.RiskQueue[0].RiskReasons[0])
	}
}
