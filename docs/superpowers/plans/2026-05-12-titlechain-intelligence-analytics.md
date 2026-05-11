# TitleChain Intelligence Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first internal TitleChain Intelligence analytics workspace at `/internal/analytics`, backed by real workflow/source-health data and consistent with the current product shell.

**Architecture:** Add a new Go `analytics` domain package that derives overview data from existing pilot, ops, stage, and core tables through SQLC queries. Expose the data through `/api/internal/analytics/overview`, then add a server-rendered Next.js internal analytics page using the existing product-shell components and compact CSS/table visualizations instead of a charting dependency.

**Tech Stack:** Go 1.24, chi, pgx/sqlc v1.31.1, PostgreSQL, Next.js 16, React 19, TypeScript, Tailwind v4, lucide-react, Vitest, Testing Library.

---

## Reference Inputs

- Spec: `docs/superpowers/specs/2026-05-12-titlechain-intelligence-analytics-design.md`
- Existing pilot metrics route: `services/api/internal/http/pilot_metrics_handler.go`
- Existing pilot metrics SQL: `db/queries/pilot.sql`
- Existing product navigation: `apps/portal/app/_lib/product/navigation.ts`
- Existing operations page pattern: `apps/portal/app/internal/ops/runs/page.tsx`
- Existing product UI primitives:
  - `apps/portal/app/_components/product-shell/ProductPage.tsx`
  - `apps/portal/app/_components/product-shell/PageHeader.tsx`
  - `apps/portal/app/_components/product/ProductPanel.tsx`
  - `apps/portal/app/_components/product/ProductStatusBadge.tsx`
  - `apps/portal/app/_components/product/StateView.tsx`

## File Structure

Backend domain:

- Create `services/api/internal/analytics/types.go` for public analytics response structs and range constants.
- Create `services/api/internal/analytics/service.go` for range normalization and the service boundary.
- Create `services/api/internal/analytics/memory_repository.go` for handler tests and local deterministic empty/populated data.
- Create `services/api/internal/analytics/service_test.go` for range/service behavior.

Backend persistence and API:

- Create `db/queries/analytics.sql` for SQLC overview queries.
- Regenerate `services/api/internal/store/sqlc/*` with `sqlc generate`.
- Create `services/api/internal/store/analytics.go` for SQLC row mapping and repository implementation.
- Create `services/api/internal/store/analytics_test.go` for mapper tests that do not require a live database.
- Create `services/api/internal/http/analytics_handler.go` for `/api/internal/analytics/overview`.
- Modify `services/api/internal/http/router.go` to add `Analytics analytics.Service` to `RouterDeps` and register the internal route.
- Modify `services/api/cmd/api/main.go` to wire `store.NewAnalyticsStore(pool)` into the router.
- Modify `services/api/internal/http/pilot_handler_test.go` or add `services/api/internal/http/analytics_handler_test.go` for route coverage.

Portal API and UI:

- Create `apps/portal/app/internal/analytics/types.ts` for the API response contract.
- Create `apps/portal/app/internal/analytics/api.ts` for authenticated server-side fetches.
- Create `apps/portal/app/internal/analytics/_lib/analytics-format.ts` for durations, percentages, range labels, and tone helpers.
- Create `apps/portal/app/internal/analytics/_lib/analytics-format.test.ts`.
- Create `apps/portal/app/internal/analytics/page.tsx`.
- Create `apps/portal/app/internal/analytics/_components/analytics-dashboard.tsx`.
- Create `apps/portal/app/internal/analytics/_components/range-switcher.tsx`.
- Create `apps/portal/app/internal/analytics/_components/metric-grid.tsx`.
- Create `apps/portal/app/internal/analytics/_components/decision-mix.tsx`.
- Create `apps/portal/app/internal/analytics/_components/reason-intelligence.tsx`.
- Create `apps/portal/app/internal/analytics/_components/evidence-coverage.tsx`.
- Create `apps/portal/app/internal/analytics/_components/source-health.tsx`.
- Create `apps/portal/app/internal/analytics/_components/risk-queue.tsx`.
- Create `apps/portal/app/internal/analytics/analytics-page.test.tsx`.
- Modify `apps/portal/app/_lib/product/navigation.ts` and `apps/portal/app/_lib/product/navigation.test.ts`.
- Modify `apps/portal/app/internal/pilot/metrics/page.tsx` to redirect to `/internal/analytics`.

Verification:

- Run backend tests: `go test ./services/api/...`
- Run SQLC generation: `go run github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1 generate`
- Run portal tests: `npm run test --workspace @titlechain/portal`
- Run portal lint: `npm run lint --workspace @titlechain/portal`
- Run portal build: `npm run build --workspace @titlechain/portal`
- Run product stack: `docker compose --env-file .env -f infra/docker/docker-compose.yml up --build`

## Commit Strategy

Use small commits:

1. `feat(api): add analytics overview service`
2. `feat(api): derive analytics overview from store`
3. `feat(portal): add analytics API and formatting`
4. `feat(portal): add analytics dashboard`
5. `feat(portal): add analytics navigation`
6. `test: verify titlechain intelligence analytics`

---

### Task 1: Backend Analytics Domain

**Files:**

- Create: `services/api/internal/analytics/types.go`
- Create: `services/api/internal/analytics/service.go`
- Create: `services/api/internal/analytics/memory_repository.go`
- Create: `services/api/internal/analytics/service_test.go`

- [ ] **Step 1: Write failing range and service tests**

Create `services/api/internal/analytics/service_test.go`:

```go
package analytics

import (
	"context"
	"testing"
	"time"
)

func TestNormalizeRangeDefaultsToThirtyDays(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC)

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
	if got := window.From.UTC(); !got.Equal(now.AddDate(0, 0, -30)) {
		t.Fatalf("from = %s, want %s", got, now.AddDate(0, 0, -30))
	}
	if !window.To.Equal(now) {
		t.Fatalf("to = %s, want %s", window.To, now)
	}
}

func TestNormalizeRangeSupportsAll(t *testing.T) {
	now := time.Date(2026, 5, 12, 10, 30, 0, 0, time.UTC)

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
	if repo.LastWindow().Key != RangeSevenDays {
		t.Fatalf("repository window key = %q, want %q", repo.LastWindow().Key, RangeSevenDays)
	}
}
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
go test ./services/api/internal/analytics -run 'TestNormalizeRange|TestService' -count=1
```

Expected: `FAIL` because the `analytics` package files and symbols do not exist yet.

- [ ] **Step 3: Add analytics public types**

Create `services/api/internal/analytics/types.go`:

```go
package analytics

import "time"

const (
	RangeSevenDays  = "7d"
	RangeThirtyDays = "30d"
	RangeNinetyDays = "90d"
	RangeAll        = "all"
)

type Range struct {
	Key  string     `json:"key"`
	From *time.Time `json:"from,omitempty"`
	To   time.Time  `json:"to"`
}

type Window struct {
	Key  string
	From *time.Time
	To   time.Time
}

type Overview struct {
	Range            Range              `json:"range"`
	OperatingSummary OperatingSummary   `json:"operating_summary"`
	DecisionMix      []DecisionMetric   `json:"decision_mix"`
	ReasonCodes      []ReasonCodeMetric `json:"reason_codes"`
	Evidence         EvidenceAnalytics  `json:"evidence"`
	SourceHealth     SourceHealth       `json:"source_health"`
	RiskQueue        []RiskQueueItem     `json:"risk_queue"`
}

type OperatingSummary struct {
	SubmittedCount          int `json:"submitted_count"`
	ResolvedCount           int `json:"resolved_count"`
	InReviewCount           int `json:"in_review_count"`
	ReopenedCount           int `json:"reopened_count"`
	UnresolvedCount         int `json:"unresolved_count"`
	AverageSecondsToResolve int `json:"average_seconds_to_resolve"`
	OldestInReviewSeconds   int `json:"oldest_in_review_seconds"`
	AcceptedProposalCount   int `json:"accepted_proposal_count"`
	ManualOverrideCount     int `json:"manual_override_count"`
}

type DecisionMetric struct {
	Decision              string `json:"decision"`
	Count                 int    `json:"count"`
	ManualCount           int    `json:"manual_count"`
	ManualOverrideCount   int    `json:"manual_override_count"`
	AcceptedProposalCount int    `json:"accepted_proposal_count"`
}

type ReasonCodeMetric struct {
	Code     string `json:"code"`
	Label    string `json:"label"`
	Category string `json:"category"`
	Count    int    `json:"count"`
}

type EvidenceAnalytics struct {
	TotalItems                    int                   `json:"total_items"`
	CasesWithoutEvidence          int                   `json:"cases_without_evidence"`
	CasesWithoutConfirmedEvidence int                   `json:"cases_without_confirmed_evidence"`
	StatusMix                     []EvidenceStatusMetric `json:"status_mix"`
	SourceTypeMix                 []EvidenceSourceMetric `json:"source_type_mix"`
}

type EvidenceStatusMetric struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type EvidenceSourceMetric struct {
	SourceType string `json:"source_type"`
	Count      int    `json:"count"`
}

type SourceHealth struct {
	LatestRunID           string     `json:"latest_run_id,omitempty"`
	LatestRunStatus       string     `json:"latest_run_status"`
	LatestError           string     `json:"latest_error"`
	FailedJobCount        int        `json:"failed_job_count"`
	PendingJobCount       int        `json:"pending_job_count"`
	QuarantinedRecordCount int       `json:"quarantined_record_count"`
	SourceLinkCount       int        `json:"source_link_count"`
	LastSuccessfulRunAt    *time.Time `json:"last_successful_run_at,omitempty"`
}

type RiskQueueItem struct {
	CaseID           string   `json:"case_id"`
	CaseReference    string   `json:"case_reference"`
	Status           string   `json:"status"`
	CustomerStatus   string   `json:"customer_status"`
	OrganizationName string   `json:"organization_name"`
	AgeSeconds       int      `json:"age_seconds"`
	RiskReasons      []string `json:"risk_reasons"`
}
```

- [ ] **Step 4: Add service and range normalization**

Create `services/api/internal/analytics/service.go`:

```go
package analytics

import (
	"context"
	"fmt"
	"time"
)

type Repository interface {
	Overview(ctx context.Context, window Window) (Overview, error)
}

type Service struct {
	repo Repository
	now  func() time.Time
}

func NewService(repo Repository) Service {
	return Service{repo: repo, now: time.Now}
}

func (s Service) GetOverview(ctx context.Context, rangeKey string) (Overview, error) {
	window, err := NormalizeRange(rangeKey, s.now().UTC())
	if err != nil {
		return Overview{}, err
	}
	overview, err := s.repo.Overview(ctx, window)
	if err != nil {
		return Overview{}, err
	}
	overview.Range = Range{Key: window.Key, From: window.From, To: window.To}
	return overview, nil
}

func NormalizeRange(rangeKey string, now time.Time) (Window, error) {
	key := rangeKey
	if key == "" {
		key = RangeThirtyDays
	}
	window := Window{Key: key, To: now.UTC()}
	switch key {
	case RangeSevenDays:
		from := window.To.AddDate(0, 0, -7)
		window.From = &from
	case RangeThirtyDays:
		from := window.To.AddDate(0, 0, -30)
		window.From = &from
	case RangeNinetyDays:
		from := window.To.AddDate(0, 0, -90)
		window.From = &from
	case RangeAll:
		window.From = nil
	default:
		return Window{}, fmt.Errorf("unsupported analytics range %q", rangeKey)
	}
	return window, nil
}
```

- [ ] **Step 5: Add memory repository**

Create `services/api/internal/analytics/memory_repository.go`:

```go
package analytics

import (
	"context"
	"sync"
)

type memoryRepository struct {
	mu       sync.RWMutex
	overview Overview
	window   Window
}

func NewMemoryRepository() *memoryRepository {
	return &memoryRepository{
		overview: Overview{
			OperatingSummary: OperatingSummary{},
			DecisionMix:      []DecisionMetric{},
			ReasonCodes:      []ReasonCodeMetric{},
			Evidence: EvidenceAnalytics{
				StatusMix:     []EvidenceStatusMetric{},
				SourceTypeMix: []EvidenceSourceMetric{},
			},
			SourceHealth: SourceHealth{LatestRunStatus: "none"},
			RiskQueue:    []RiskQueueItem{},
		},
	}
}

func (r *memoryRepository) SetOverview(overview Overview) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.overview = overview
}

func (r *memoryRepository) Overview(ctx context.Context, window Window) (Overview, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.window = window
	return r.overview, nil
}

func (r *memoryRepository) LastWindow() Window {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.window
}
```

- [ ] **Step 6: Run the analytics domain tests**

Run:

```bash
go test ./services/api/internal/analytics -count=1
```

Expected: `ok   github.com/nyasha-hama/titlechain/services/api/internal/analytics`.

- [ ] **Step 7: Commit**

Run:

```bash
git add services/api/internal/analytics
git commit -m "feat(api): add analytics overview service"
```

---

### Task 2: SQLC Analytics Queries And Store

**Files:**

- Create: `db/queries/analytics.sql`
- Generated: `services/api/internal/store/sqlc/analytics.sql.go`
- Modify generated: `services/api/internal/store/sqlc/querier.go`
- Create: `services/api/internal/store/analytics.go`
- Create: `services/api/internal/store/analytics_test.go`

- [ ] **Step 1: Add analytics SQLC queries**

Create `db/queries/analytics.sql`:

```sql
-- name: GetAnalyticsOperatingSummary :one
WITH scoped_matters AS (
    SELECT ml.submitted_at, ml.customer_status, c.status, c.resolved_at
    FROM pilot.matter_links ml
    JOIN ops.case_records c ON c.id = ml.case_id
    WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR ml.submitted_at >= sqlc.narg('from_at')::timestamptz)
      AND ml.submitted_at < sqlc.arg('to_at')::timestamptz
),
current_decisions AS (
    SELECT d.decision_source
    FROM ops.case_decisions d
    JOIN ops.case_records c ON c.id = d.case_id
    WHERE d.status = 'current'
      AND (sqlc.narg('from_at')::timestamptz IS NULL OR d.created_at >= sqlc.narg('from_at')::timestamptz)
      AND d.created_at < sqlc.arg('to_at')::timestamptz
)
SELECT
    COUNT(*)::int AS submitted_count,
    COUNT(*) FILTER (WHERE customer_status = 'resolved')::int AS resolved_count,
    COUNT(*) FILTER (WHERE customer_status = 'in_review')::int AS in_review_count,
    COUNT(*) FILTER (WHERE customer_status = 'reopened')::int AS reopened_count,
    COUNT(*) FILTER (WHERE status = 'closed_unresolved')::int AS unresolved_count,
    COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - submitted_at))) FILTER (WHERE resolved_at IS NOT NULL), 0)::int AS average_seconds_to_resolve,
    COALESCE(MAX(EXTRACT(EPOCH FROM (sqlc.arg('to_at')::timestamptz - submitted_at))) FILTER (WHERE customer_status = 'in_review'), 0)::int AS oldest_in_review_seconds,
    (SELECT COUNT(*) FROM current_decisions WHERE decision_source = 'accepted_proposal')::int AS accepted_proposal_count,
    (SELECT COUNT(*) FROM current_decisions WHERE decision_source = 'manual_override')::int AS manual_override_count
FROM scoped_matters;

-- name: ListAnalyticsDecisionMix :many
SELECT
    d.decision,
    COUNT(*)::int AS count,
    COUNT(*) FILTER (WHERE d.decision_source = 'manual')::int AS manual_count,
    COUNT(*) FILTER (WHERE d.decision_source = 'manual_override')::int AS manual_override_count,
    COUNT(*) FILTER (WHERE d.decision_source = 'accepted_proposal')::int AS accepted_proposal_count
FROM ops.case_decisions d
WHERE d.status = 'current'
  AND (sqlc.narg('from_at')::timestamptz IS NULL OR d.created_at >= sqlc.narg('from_at')::timestamptz)
  AND d.created_at < sqlc.arg('to_at')::timestamptz
GROUP BY d.decision
ORDER BY count DESC, d.decision ASC;

-- name: ListAnalyticsReasonCodes :many
SELECT
    rc.code,
    rc.label,
    rc.category,
    COUNT(*)::int AS count
FROM ops.case_decisions d
JOIN ops.case_decision_reason_codes drc ON drc.decision_id = d.id
JOIN ops.reason_codes rc ON rc.code = drc.reason_code
WHERE d.status = 'current'
  AND (sqlc.narg('from_at')::timestamptz IS NULL OR d.created_at >= sqlc.narg('from_at')::timestamptz)
  AND d.created_at < sqlc.arg('to_at')::timestamptz
GROUP BY rc.code, rc.label, rc.category
ORDER BY count DESC, rc.sort_order ASC, rc.label ASC;

-- name: GetAnalyticsEvidenceSummary :one
WITH scoped_cases AS (
    SELECT c.id
    FROM ops.case_records c
    WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR c.created_at >= sqlc.narg('from_at')::timestamptz)
      AND c.created_at < sqlc.arg('to_at')::timestamptz
),
case_evidence AS (
    SELECT
        sc.id AS case_id,
        COUNT(e.id)::int AS evidence_count,
        COUNT(e.id) FILTER (WHERE e.evidence_status = 'confirmed')::int AS confirmed_count
    FROM scoped_cases sc
    LEFT JOIN ops.case_evidence_items e ON e.case_id = sc.id
    GROUP BY sc.id
)
SELECT
    COALESCE((SELECT COUNT(*) FROM ops.case_evidence_items e WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR e.created_at >= sqlc.narg('from_at')::timestamptz) AND e.created_at < sqlc.arg('to_at')::timestamptz), 0)::int AS total_items,
    COUNT(*) FILTER (WHERE evidence_count = 0)::int AS cases_without_evidence,
    COUNT(*) FILTER (WHERE confirmed_count = 0)::int AS cases_without_confirmed_evidence
FROM case_evidence;

-- name: ListAnalyticsEvidenceStatusMix :many
SELECT evidence_status AS status, COUNT(*)::int AS count
FROM ops.case_evidence_items
WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR created_at >= sqlc.narg('from_at')::timestamptz)
  AND created_at < sqlc.arg('to_at')::timestamptz
GROUP BY evidence_status
ORDER BY count DESC, evidence_status ASC;

-- name: ListAnalyticsEvidenceSourceTypeMix :many
SELECT source_type, COUNT(*)::int AS count
FROM ops.case_evidence_items
WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR created_at >= sqlc.narg('from_at')::timestamptz)
  AND created_at < sqlc.arg('to_at')::timestamptz
GROUP BY source_type
ORDER BY count DESC, source_type ASC;

-- name: GetAnalyticsSourceHealth :one
WITH latest_run AS (
    SELECT id, status
    FROM ops.runs
    ORDER BY created_at DESC
    LIMIT 1
),
latest_success AS (
    SELECT finished_at
    FROM ops.runs
    WHERE status = 'completed'
    ORDER BY finished_at DESC NULLS LAST, created_at DESC
    LIMIT 1
)
SELECT
    COALESCE((SELECT id::text FROM latest_run), '') AS latest_run_id,
    COALESCE((SELECT status FROM latest_run), 'none') AS latest_run_status,
    COALESCE((
        SELECT j.error_message
        FROM ops.jobs j
        JOIN latest_run lr ON lr.id = j.run_id
        WHERE j.error_message IS NOT NULL AND j.error_message <> ''
        ORDER BY j.updated_at DESC
        LIMIT 1
    ), '') AS latest_error,
    COALESCE((
        SELECT COUNT(*) FROM ops.jobs j JOIN latest_run lr ON lr.id = j.run_id WHERE j.status = 'failed'
    ), 0)::int AS failed_job_count,
    COALESCE((
        SELECT COUNT(*) FROM ops.jobs j JOIN latest_run lr ON lr.id = j.run_id WHERE j.status IN ('pending', 'leased', 'running')
    ), 0)::int AS pending_job_count,
    (SELECT COUNT(*) FROM stage.quarantined_records)::int AS quarantined_record_count,
    (SELECT COUNT(*) FROM core.source_links)::int AS source_link_count,
    (SELECT finished_at FROM latest_success)::timestamptz AS last_successful_run_at;

-- name: ListAnalyticsRiskQueue :many
SELECT
    c.id::text AS case_id,
    c.case_reference,
    c.status,
    COALESCE(ml.customer_status, '') AS customer_status,
    COALESCE(o.name, '') AS organization_name,
    EXTRACT(EPOCH FROM (sqlc.arg('to_at')::timestamptz - c.created_at))::int AS age_seconds,
    array_remove(ARRAY[
        CASE WHEN c.status = 'in_review' THEN 'in_review' END,
        CASE WHEN c.status = 'reopened' THEN 'reopened' END,
        CASE WHEN d.decision = 'stop' THEN 'stop_decision' END,
        CASE WHEN d.decision = 'review' THEN 'review_decision' END,
        CASE WHEN COUNT(e.id) FILTER (WHERE e.evidence_status = 'confirmed') = 0 THEN 'no_confirmed_evidence' END,
        CASE WHEN COUNT(e.id) FILTER (WHERE e.evidence_status = 'conflicting') > 0 THEN 'conflicting_evidence' END
    ], NULL)::text[] AS risk_reasons
FROM ops.case_records c
LEFT JOIN pilot.matter_links ml ON ml.case_id = c.id
LEFT JOIN pilot.organizations o ON o.id = ml.organization_id
LEFT JOIN ops.case_decisions d ON d.case_id = c.id AND d.status = 'current'
LEFT JOIN ops.case_evidence_items e ON e.case_id = c.id
WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR c.created_at >= sqlc.narg('from_at')::timestamptz)
  AND c.created_at < sqlc.arg('to_at')::timestamptz
  AND (
      c.status IN ('in_review', 'reopened')
      OR d.decision IN ('stop', 'review')
      OR EXISTS (SELECT 1 FROM ops.case_evidence_items ce WHERE ce.case_id = c.id AND ce.evidence_status = 'conflicting')
      OR NOT EXISTS (SELECT 1 FROM ops.case_evidence_items ce WHERE ce.case_id = c.id AND ce.evidence_status = 'confirmed')
  )
GROUP BY c.id, c.case_reference, c.status, ml.customer_status, o.name, c.created_at, d.decision
ORDER BY age_seconds DESC
LIMIT 12;
```

- [ ] **Step 2: Generate SQLC code**

Run:

```bash
go run github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1 generate
```

Expected: generated files update under `services/api/internal/store/sqlc/`, including `analytics.sql.go` and new methods in `querier.go`.

- [ ] **Step 3: Write failing store mapper tests**

Create `services/api/internal/store/analytics_test.go`:

```go
package store

import (
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

func TestAnalyticsOperatingSummaryFromRow(t *testing.T) {
	got := analyticsOperatingSummaryFromRow(sqlc.GetAnalyticsOperatingSummaryRow{
		SubmittedCount:          9,
		ResolvedCount:           5,
		InReviewCount:           2,
		ReopenedCount:           1,
		UnresolvedCount:         1,
		AverageSecondsToResolve: 3600,
		OldestInReviewSeconds:   7200,
		AcceptedProposalCount:   4,
		ManualOverrideCount:     1,
	})

	if got.SubmittedCount != 9 {
		t.Fatalf("SubmittedCount = %d, want 9", got.SubmittedCount)
	}
	if got.AcceptedProposalCount != 4 {
		t.Fatalf("AcceptedProposalCount = %d, want 4", got.AcceptedProposalCount)
	}
}

func TestAnalyticsRiskReasonsFromSQLArray(t *testing.T) {
	got := analyticsRiskReasons([]string{"in_review", "conflicting_evidence"})

	if len(got) != 2 {
		t.Fatalf("len = %d, want 2", len(got))
	}
	if got[1] != "conflicting_evidence" {
		t.Fatalf("second reason = %q, want conflicting_evidence", got[1])
	}
}
```

- [ ] **Step 4: Run failing store tests**

Run:

```bash
go test ./services/api/internal/store -run 'TestAnalytics' -count=1
```

Expected: `FAIL` because `analyticsOperatingSummaryFromRow` and `analyticsRiskReasons` are not defined.

- [ ] **Step 5: Add analytics store implementation**

Create `services/api/internal/store/analytics.go`:

```go
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
	decisions, err := queries.ListAnalyticsDecisionMix(ctx, sqlc.ListAnalyticsDecisionMixParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	reasons, err := queries.ListAnalyticsReasonCodes(ctx, sqlc.ListAnalyticsReasonCodesParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	evidence, err := queries.GetAnalyticsEvidenceSummary(ctx, sqlc.GetAnalyticsEvidenceSummaryParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	statusMix, err := queries.ListAnalyticsEvidenceStatusMix(ctx, sqlc.ListAnalyticsEvidenceStatusMixParams{FromAt: from, ToAt: to})
	if err != nil {
		return analytics.Overview{}, err
	}
	sourceMix, err := queries.ListAnalyticsEvidenceSourceTypeMix(ctx, sqlc.ListAnalyticsEvidenceSourceTypeMixParams{FromAt: from, ToAt: to})
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
		OperatingSummary: analyticsOperatingSummaryFromRow(summary),
		DecisionMix:      analyticsDecisionMixFromRows(decisions),
		ReasonCodes:      analyticsReasonCodesFromRows(reasons),
		Evidence:         analyticsEvidenceFromRows(evidence, statusMix, sourceMix),
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
```

- [ ] **Step 6: Run generation and store tests**

Run:

```bash
go run github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1 generate
go test ./services/api/internal/store -run 'TestAnalytics' -count=1
```

Expected: SQLC generation succeeds and store mapper tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add db/queries/analytics.sql services/api/internal/store/analytics.go services/api/internal/store/analytics_test.go services/api/internal/store/sqlc
git commit -m "feat(api): derive analytics overview from store"
```

---

### Task 3: Backend HTTP Route And Wiring

**Files:**

- Create: `services/api/internal/http/analytics_handler.go`
- Create: `services/api/internal/http/analytics_handler_test.go`
- Modify: `services/api/internal/http/router.go`
- Modify: `services/api/cmd/api/main.go`

- [ ] **Step 1: Write failing handler tests**

Create `services/api/internal/http/analytics_handler_test.go`:

```go
package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
)

func TestAnalyticsOverviewRoute(t *testing.T) {
	repo := analytics.NewMemoryRepository()
	service := analytics.NewService(repo)
	router := NewRouter(RouterDeps{Analytics: service})

	req := httptest.NewRequest(http.MethodGet, "/api/internal/analytics/overview?range=7d", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var overview analytics.Overview
	if err := json.NewDecoder(rec.Body).Decode(&overview); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if overview.Range.Key != analytics.RangeSevenDays {
		t.Fatalf("range key = %q, want %q", overview.Range.Key, analytics.RangeSevenDays)
	}
}

func TestAnalyticsOverviewRejectsUnknownRange(t *testing.T) {
	router := NewRouter(RouterDeps{Analytics: analytics.NewService(analytics.NewMemoryRepository())})

	req := httptest.NewRequest(http.MethodGet, "/api/internal/analytics/overview?range=365d", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
}
```

- [ ] **Step 2: Run failing handler tests**

Run:

```bash
go test ./services/api/internal/http -run 'TestAnalyticsOverview' -count=1
```

Expected: `FAIL` because `RouterDeps.Analytics` and the route do not exist.

- [ ] **Step 3: Add HTTP handler**

Create `services/api/internal/http/analytics_handler.go`:

```go
package http

import (
	stdhttp "net/http"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
)

type analyticsHandler struct {
	service analytics.Service
}

func newAnalyticsHandler(service analytics.Service) analyticsHandler {
	return analyticsHandler{service: service}
}

func (h analyticsHandler) overview(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	overview, err := h.service.GetOverview(r.Context(), r.URL.Query().Get("range"))
	if err != nil {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, overview)
}
```

- [ ] **Step 4: Register the route**

Modify `services/api/internal/http/router.go`:

```go
import (
	stdhttp "net/http"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

type RouterDeps struct {
	Analytics  analytics.Service
	Cases      cases.Service
	Properties property.Service
	Jobs       jobs.Service
	Pilot      pilot.Service
}
```

Inside `r.Route("/api/internal", func(r chi.Router) { ... })`, add:

```go
analyticsHandler := newAnalyticsHandler(deps.Analytics)
r.Get("/analytics/overview", analyticsHandler.overview)
```

- [ ] **Step 5: Wire the service in the API binary**

Modify `services/api/cmd/api/main.go`:

```go
analyticsStore := store.NewAnalyticsStore(pool)
analyticsService := analytics.NewService(analyticsStore)

server := &http.Server{
	Addr: cfg.HTTPAddr,
	Handler: apihttp.NewRouter(apihttp.RouterDeps{
		Analytics:  analyticsService,
		Cases:      casesService,
		Properties: propertiesService,
		Jobs:       jobsService,
		Pilot:      pilotService,
	}),
}
```

Add the import:

```go
"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
```

- [ ] **Step 6: Run backend route tests**

Run:

```bash
go test ./services/api/internal/http -run 'TestAnalyticsOverview|TestPilotMetricsRoute' -count=1
```

Expected: analytics route tests pass and the existing pilot metrics route still returns `200`.

- [ ] **Step 7: Commit**

Run:

```bash
git add services/api/internal/http/analytics_handler.go services/api/internal/http/analytics_handler_test.go services/api/internal/http/router.go services/api/cmd/api/main.go
git commit -m "feat(api): expose analytics overview route"
```

---

### Task 4: Portal Analytics Types, API, And Formatting

**Files:**

- Create: `apps/portal/app/internal/analytics/types.ts`
- Create: `apps/portal/app/internal/analytics/api.ts`
- Create: `apps/portal/app/internal/analytics/_lib/analytics-format.ts`
- Create: `apps/portal/app/internal/analytics/_lib/analytics-format.test.ts`

- [ ] **Step 1: Write formatting tests**

Create `apps/portal/app/internal/analytics/_lib/analytics-format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatPercent,
  rangeLabel,
  statusTone,
} from "./analytics-format";

describe("analytics formatting", () => {
  it("formats durations from seconds", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(59)).toBe("1m");
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(90000)).toBe("1d 1h");
  });

  it("formats percentages without dividing by zero", () => {
    expect(formatPercent(0, 0)).toBe("0%");
    expect(formatPercent(3, 10)).toBe("30%");
  });

  it("labels analytics ranges", () => {
    expect(rangeLabel("7d")).toBe("7 days");
    expect(rangeLabel("30d")).toBe("30 days");
    expect(rangeLabel("90d")).toBe("90 days");
    expect(rangeLabel("all")).toBe("All time");
  });

  it("maps risky statuses to danger tones", () => {
    expect(statusTone("failed")).toBe("danger");
    expect(statusTone("review")).toBe("warning");
    expect(statusTone("completed")).toBe("success");
  });
});
```

- [ ] **Step 2: Run failing formatting tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- analytics-format
```

Expected: `FAIL` because `analytics-format.ts` does not exist.

- [ ] **Step 3: Add TypeScript response types**

Create `apps/portal/app/internal/analytics/types.ts`:

```ts
import type { ProductTone } from "@/app/_lib/product/status";

export type AnalyticsRangeKey = "7d" | "30d" | "90d" | "all";

export type AnalyticsRange = {
  key: AnalyticsRangeKey;
  from?: string;
  to: string;
};

export type OperatingSummary = {
  submitted_count: number;
  resolved_count: number;
  in_review_count: number;
  reopened_count: number;
  unresolved_count: number;
  average_seconds_to_resolve: number;
  oldest_in_review_seconds: number;
  accepted_proposal_count: number;
  manual_override_count: number;
};

export type DecisionMetric = {
  decision: "clear" | "review" | "stop" | string;
  count: number;
  manual_count: number;
  manual_override_count: number;
  accepted_proposal_count: number;
};

export type ReasonCodeMetric = {
  code: string;
  label: string;
  category: string;
  count: number;
};

export type EvidenceStatusMetric = {
  status: string;
  count: number;
};

export type EvidenceSourceMetric = {
  source_type: string;
  count: number;
};

export type EvidenceAnalytics = {
  total_items: number;
  cases_without_evidence: number;
  cases_without_confirmed_evidence: number;
  status_mix: EvidenceStatusMetric[];
  source_type_mix: EvidenceSourceMetric[];
};

export type SourceHealth = {
  latest_run_id?: string;
  latest_run_status: string;
  latest_error: string;
  failed_job_count: number;
  pending_job_count: number;
  quarantined_record_count: number;
  source_link_count: number;
  last_successful_run_at?: string;
};

export type RiskQueueItem = {
  case_id: string;
  case_reference: string;
  status: string;
  customer_status: string;
  organization_name: string;
  age_seconds: number;
  risk_reasons: string[];
};

export type AnalyticsOverview = {
  range: AnalyticsRange;
  operating_summary: OperatingSummary;
  decision_mix: DecisionMetric[];
  reason_codes: ReasonCodeMetric[];
  evidence: EvidenceAnalytics;
  source_health: SourceHealth;
  risk_queue: RiskQueueItem[];
};

export type AnalyticsTone = ProductTone;
```

- [ ] **Step 4: Add formatting utilities**

Create `apps/portal/app/internal/analytics/_lib/analytics-format.ts`:

```ts
import type { AnalyticsRangeKey, AnalyticsTone } from "../types";

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0m";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function rangeLabel(range: AnalyticsRangeKey): string {
  const labels: Record<AnalyticsRangeKey, string> = {
    "7d": "7 days",
    "30d": "30 days",
    "90d": "90 days",
    all: "All time",
  };
  return labels[range];
}

export function statusTone(status: string): AnalyticsTone {
  const normalized = status.toLowerCase();
  if (["failed", "stop", "closed_unresolved", "conflicting"].includes(normalized)) return "danger";
  if (["review", "in_review", "reopened", "pending", "running", "quarantined"].includes(normalized)) return "warning";
  if (["clear", "resolved", "completed", "confirmed"].includes(normalized)) return "success";
  return "muted";
}

export function titleize(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
```

- [ ] **Step 5: Add portal API fetch**

Create `apps/portal/app/internal/analytics/api.ts`:

```ts
import type { AnalyticsOverview, AnalyticsRangeKey } from "./types";
import { requirePilotAdmin } from "@/app/_lib/product/server-auth";

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

async function fetchJson<T>(path: string): Promise<T> {
  await requirePilotAdmin();
  const res = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getAnalyticsOverview(range: AnalyticsRangeKey = "30d"): Promise<AnalyticsOverview> {
  const params = new URLSearchParams({ range });
  return fetchJson<AnalyticsOverview>(`/api/internal/analytics/overview?${params.toString()}`);
}
```

- [ ] **Step 6: Run portal formatting tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- analytics-format
```

Expected: `PASS`.

- [ ] **Step 7: Commit**

Run:

```bash
git add apps/portal/app/internal/analytics/types.ts apps/portal/app/internal/analytics/api.ts apps/portal/app/internal/analytics/_lib
git commit -m "feat(portal): add analytics API and formatting"
```

---

### Task 5: Portal Analytics Dashboard UI

**Files:**

- Create: `apps/portal/app/internal/analytics/page.tsx`
- Create: `apps/portal/app/internal/analytics/_components/analytics-dashboard.tsx`
- Create: `apps/portal/app/internal/analytics/_components/range-switcher.tsx`
- Create: `apps/portal/app/internal/analytics/_components/metric-grid.tsx`
- Create: `apps/portal/app/internal/analytics/_components/decision-mix.tsx`
- Create: `apps/portal/app/internal/analytics/_components/reason-intelligence.tsx`
- Create: `apps/portal/app/internal/analytics/_components/evidence-coverage.tsx`
- Create: `apps/portal/app/internal/analytics/_components/source-health.tsx`
- Create: `apps/portal/app/internal/analytics/_components/risk-queue.tsx`
- Create: `apps/portal/app/internal/analytics/analytics-page.test.tsx`

- [ ] **Step 1: Write dashboard component tests**

Create `apps/portal/app/internal/analytics/analytics-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import type { AnalyticsOverview } from "./types";

const overview: AnalyticsOverview = {
  range: { key: "30d", from: "2026-04-12T00:00:00Z", to: "2026-05-12T00:00:00Z" },
  operating_summary: {
    submitted_count: 12,
    resolved_count: 8,
    in_review_count: 2,
    reopened_count: 1,
    unresolved_count: 1,
    average_seconds_to_resolve: 86400,
    oldest_in_review_seconds: 172800,
    accepted_proposal_count: 6,
    manual_override_count: 2,
  },
  decision_mix: [
    { decision: "clear", count: 5, manual_count: 1, manual_override_count: 0, accepted_proposal_count: 4 },
    { decision: "review", count: 3, manual_count: 1, manual_override_count: 1, accepted_proposal_count: 1 },
  ],
  reason_codes: [
    { code: "ACTIVE_INTERDICT", label: "Active interdict or transfer restriction found", category: "hard_block", count: 3 },
  ],
  evidence: {
    total_items: 20,
    cases_without_evidence: 2,
    cases_without_confirmed_evidence: 4,
    status_mix: [{ status: "confirmed", count: 12 }],
    source_type_mix: [{ source_type: "deeds_office", count: 10 }],
  },
  source_health: {
    latest_run_id: "run-1",
    latest_run_status: "completed",
    latest_error: "",
    failed_job_count: 0,
    pending_job_count: 1,
    quarantined_record_count: 0,
    source_link_count: 42,
    last_successful_run_at: "2026-05-12T08:30:00Z",
  },
  risk_queue: [
    {
      case_id: "case-1",
      case_reference: "TC-2026-0001",
      status: "in_review",
      customer_status: "in_review",
      organization_name: "Hama & Associates Inc",
      age_seconds: 172800,
      risk_reasons: ["in_review", "conflicting_evidence"],
    },
  ],
};

describe("analytics dashboard", () => {
  it("renders operating, evidence, source, and risk sections", () => {
    render(<AnalyticsDashboard overview={overview} selectedRange="30d" />);

    expect(screen.getByText("Operating summary")).toBeInTheDocument();
    expect(screen.getByText("Decision intelligence")).toBeInTheDocument();
    expect(screen.getByText("Evidence coverage")).toBeInTheDocument();
    expect(screen.getByText("Source health")).toBeInTheDocument();
    expect(screen.getByText("TC-2026-0001")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing dashboard tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- analytics-page
```

Expected: `FAIL` because `AnalyticsDashboard` does not exist.

- [ ] **Step 3: Add range switcher**

Create `apps/portal/app/internal/analytics/_components/range-switcher.tsx`:

```tsx
import Link from "next/link";
import type { AnalyticsRangeKey } from "../types";
import { rangeLabel } from "../_lib/analytics-format";
import { cn } from "@/app/_lib/cn";

const ranges: AnalyticsRangeKey[] = ["7d", "30d", "90d", "all"];

export function RangeSwitcher({ selectedRange }: { selectedRange: AnalyticsRangeKey }) {
  return (
    <div className="inline-flex rounded-md border border-tc-border bg-tc-surface-subtle p-1">
      {ranges.map((range) => (
        <Link
          key={range}
          href={`/internal/analytics?range=${range}`}
          className={cn(
            "rounded px-3 py-1.5 text-[12px] font-medium text-tc-text-muted transition hover:text-tc-text",
            selectedRange === range && "bg-tc-surface text-tc-text shadow-sm"
          )}
        >
          {rangeLabel(range)}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add metric grid**

Create `apps/portal/app/internal/analytics/_components/metric-grid.tsx`:

```tsx
import type { OperatingSummary } from "../types";
import { formatDuration } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

export function MetricGrid({ summary }: { summary: OperatingSummary }) {
  const metrics = [
    { label: "Submitted", value: summary.submitted_count.toLocaleString() },
    { label: "Resolved", value: summary.resolved_count.toLocaleString() },
    { label: "In Review", value: summary.in_review_count.toLocaleString() },
    { label: "Reopened", value: summary.reopened_count.toLocaleString() },
    { label: "Closed Unresolved", value: summary.unresolved_count.toLocaleString() },
    { label: "Avg Resolve Time", value: formatDuration(summary.average_seconds_to_resolve) },
    { label: "Oldest Review", value: formatDuration(summary.oldest_in_review_seconds) },
    { label: "Manual Overrides", value: summary.manual_override_count.toLocaleString() },
  ];

  return (
    <section>
      <h2 className="text-sm font-semibold text-tc-text">Operating summary</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <ProductPanel key={metric.label} className="p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-tc-text">{metric.value}</p>
          </ProductPanel>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add compact insight sections**

Create these components with the same import style as `MetricGrid`:

```tsx
// apps/portal/app/internal/analytics/_components/decision-mix.tsx
import type { DecisionMetric } from "../types";
import { formatPercent, statusTone, titleize } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

export function DecisionMix({ decisions }: { decisions: DecisionMetric[] }) {
  const total = decisions.reduce((sum, item) => sum + item.count, 0);
  return (
    <ProductPanel>
      <h2 className="text-sm font-semibold text-tc-text">Decision intelligence</h2>
      <div className="mt-4 space-y-3">
        {decisions.length === 0 ? (
          <p className="text-[13px] text-tc-text-muted">No current decisions in this range.</p>
        ) : (
          decisions.map((decision) => (
            <div key={decision.decision}>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <ProductStatusBadge label={titleize(decision.decision)} tone={statusTone(decision.decision)} />
                <span className="font-medium text-tc-text">{decision.count} · {formatPercent(decision.count, total)}</span>
              </div>
              <div className="mt-2 h-2 rounded bg-tc-surface-subtle">
                <div className="h-2 rounded bg-tc-accent" style={{ width: formatPercent(decision.count, total) }} />
              </div>
            </div>
          ))
        )}
      </div>
    </ProductPanel>
  );
}
```

```tsx
// apps/portal/app/internal/analytics/_components/reason-intelligence.tsx
import type { ReasonCodeMetric } from "../types";
import { titleize } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

export function ReasonIntelligence({ reasons }: { reasons: ReasonCodeMetric[] }) {
  return (
    <ProductPanel>
      <h2 className="text-sm font-semibold text-tc-text">Reason intelligence</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
            <tr><th className="pb-2">Reason</th><th className="pb-2">Category</th><th className="pb-2 text-right">Count</th></tr>
          </thead>
          <tbody className="divide-y divide-tc-border">
            {reasons.length === 0 ? (
              <tr><td className="py-4 text-tc-text-muted" colSpan={3}>No reason codes in this range.</td></tr>
            ) : reasons.map((reason) => (
              <tr key={reason.code}>
                <td className="py-3 font-medium text-tc-text">{reason.label}</td>
                <td className="py-3 text-tc-text-muted">{titleize(reason.category)}</td>
                <td className="py-3 text-right font-medium text-tc-text">{reason.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProductPanel>
  );
}
```

Create `apps/portal/app/internal/analytics/_components/evidence-coverage.tsx`:

```tsx
import type { EvidenceAnalytics } from "../types";
import { titleize } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

export function EvidenceCoverage({ evidence }: { evidence: EvidenceAnalytics }) {
  return (
    <ProductPanel>
      <h2 className="text-sm font-semibold text-tc-text">Evidence coverage</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <EvidenceStat label="Items" value={evidence.total_items} />
        <EvidenceStat label="No Evidence" value={evidence.cases_without_evidence} />
        <EvidenceStat label="No Confirmed Evidence" value={evidence.cases_without_confirmed_evidence} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <EvidenceList title="Status mix" rows={evidence.status_mix.map((row) => [titleize(row.status), row.count])} />
        <EvidenceList title="Source mix" rows={evidence.source_type_mix.map((row) => [titleize(row.source_type), row.count])} />
      </div>
    </ProductPanel>
  );
}

function EvidenceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">{label}</p>
      <p className="mt-2 text-xl font-semibold text-tc-text">{value}</p>
    </div>
  );
}

function EvidenceList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div>
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">{title}</h3>
      <div className="mt-2 divide-y divide-tc-border">
        {rows.length === 0 ? (
          <p className="py-3 text-[13px] text-tc-text-muted">No evidence data in this range.</p>
        ) : rows.map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2 text-[13px]">
            <span className="text-tc-text-muted">{label}</span>
            <span className="font-medium text-tc-text">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `apps/portal/app/internal/analytics/_components/source-health.tsx`:

```tsx
import type { SourceHealth } from "../types";
import { statusTone, titleize } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

export function SourceHealthPanel({ sourceHealth }: { sourceHealth: SourceHealth }) {
  return (
    <ProductPanel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-tc-text">Source health</h2>
        <ProductStatusBadge label={titleize(sourceHealth.latest_run_status)} tone={statusTone(sourceHealth.latest_run_status)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SourceStat label="Failed Jobs" value={sourceHealth.failed_job_count} />
        <SourceStat label="Pending Jobs" value={sourceHealth.pending_job_count} />
        <SourceStat label="Quarantined Rows" value={sourceHealth.quarantined_record_count} />
        <SourceStat label="Source Links" value={sourceHealth.source_link_count} />
      </div>
      {sourceHealth.latest_error ? (
        <p className="mt-4 rounded-md border border-tc-danger/30 bg-tc-danger/10 p-3 text-[13px] text-tc-danger">
          {sourceHealth.latest_error}
        </p>
      ) : null}
    </ProductPanel>
  );
}

function SourceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
      <p className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">{label}</p>
      <p className="mt-2 text-xl font-semibold text-tc-text">{value}</p>
    </div>
  );
}
```

Create `apps/portal/app/internal/analytics/_components/risk-queue.tsx`:

```tsx
import Link from "next/link";
import type { RiskQueueItem } from "../types";
import { formatDuration, statusTone, titleize } from "../_lib/analytics-format";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

export function RiskQueue({ items }: { items: RiskQueueItem[] }) {
  return (
    <ProductPanel>
      <h2 className="text-sm font-semibold text-tc-text">Risk queue</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
            <tr>
              <th className="pb-2">Case</th>
              <th className="pb-2">Organization</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Age</th>
              <th className="pb-2">Reasons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tc-border">
            {items.length === 0 ? (
              <tr><td className="py-4 text-tc-text-muted" colSpan={5}>No risk queue items in this range.</td></tr>
            ) : items.map((item) => (
              <tr key={item.case_id}>
                <td className="py-3 font-medium text-tc-text">
                  <Link href={`/internal/cases/${item.case_id}`} className="hover:text-tc-accent">
                    {item.case_reference}
                  </Link>
                </td>
                <td className="py-3 text-tc-text-muted">{item.organization_name || "Internal"}</td>
                <td className="py-3">
                  <ProductStatusBadge label={titleize(item.status)} tone={statusTone(item.status)} />
                </td>
                <td className="py-3 text-tc-text-muted">{formatDuration(item.age_seconds)}</td>
                <td className="py-3 text-tc-text-muted">{item.risk_reasons.map(titleize).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProductPanel>
  );
}
```

- [ ] **Step 6: Add dashboard composition and page**

Create `apps/portal/app/internal/analytics/_components/analytics-dashboard.tsx`:

```tsx
import type { AnalyticsOverview, AnalyticsRangeKey } from "../types";
import { DecisionMix } from "./decision-mix";
import { EvidenceCoverage } from "./evidence-coverage";
import { MetricGrid } from "./metric-grid";
import { RangeSwitcher } from "./range-switcher";
import { ReasonIntelligence } from "./reason-intelligence";
import { RiskQueue } from "./risk-queue";
import { SourceHealthPanel } from "./source-health";

export function AnalyticsDashboard({
  overview,
  selectedRange,
}: {
  overview: AnalyticsOverview;
  selectedRange: AnalyticsRangeKey;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <RangeSwitcher selectedRange={selectedRange} />
      </div>
      <MetricGrid summary={overview.operating_summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <DecisionMix decisions={overview.decision_mix} />
        <ReasonIntelligence reasons={overview.reason_codes} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <EvidenceCoverage evidence={overview.evidence} />
        <SourceHealthPanel sourceHealth={overview.source_health} />
      </div>
      <RiskQueue items={overview.risk_queue} />
    </div>
  );
}
```

Create `apps/portal/app/internal/analytics/page.tsx`:

```tsx
import { getAnalyticsOverview } from "./api";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import type { AnalyticsRangeKey } from "./types";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";

const validRanges = new Set(["7d", "30d", "90d", "all"]);

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const requestedRange = params?.range;
  const selectedRange = validRanges.has(requestedRange ?? "") ? (requestedRange as AnalyticsRangeKey) : "30d";
  const overview = await getAnalyticsOverview(selectedRange);

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Operations"
        title="TitleChain Intelligence"
        description="Operational analytics for matters, decisions, evidence coverage, and source-data health."
      />
      <AnalyticsDashboard overview={overview} selectedRange={selectedRange} />
    </ProductPage>
  );
}
```

- [ ] **Step 7: Run dashboard tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- analytics-page
```

Expected: `PASS`.

- [ ] **Step 8: Commit**

Run:

```bash
git add apps/portal/app/internal/analytics
git commit -m "feat(portal): add analytics dashboard"
```

---

### Task 6: Navigation And Legacy Metrics Redirect

**Files:**

- Modify: `apps/portal/app/_lib/product/navigation.ts`
- Modify: `apps/portal/app/_lib/product/navigation.test.ts`
- Modify: `apps/portal/app/internal/pilot/metrics/page.tsx`

- [ ] **Step 1: Update navigation tests**

Modify `apps/portal/app/_lib/product/navigation.test.ts`:

```ts
it("shows analytics for pilot admins", () => {
  const visible = getVisibleProductNavigation("pilot_admin");
  expect(visible.flatMap((group) => group.items.map((item) => item.href))).toContain(
    "/internal/analytics"
  );
});

it("resolves nested analytics routes to analytics", () => {
  expect(resolveActiveProductRoute("/internal/analytics/evidence")).toBe("/internal/analytics");
});
```

- [ ] **Step 2: Run failing navigation tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- navigation
```

Expected: `FAIL` because analytics is not yet in the navigation.

- [ ] **Step 3: Add Analytics to Operations navigation**

Modify `apps/portal/app/_lib/product/navigation.ts`:

```ts
import {
  Activity,
  BarChart3,
  Building2,
  FilePlus2,
  FolderKanban,
  Home,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";
```

Add the item before Runs:

```ts
{ label: "Analytics", href: "/internal/analytics", icon: BarChart3, roles: ["pilot_admin"] },
```

- [ ] **Step 4: Redirect legacy metrics page**

Replace `apps/portal/app/internal/pilot/metrics/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function PilotMetricsPage() {
  redirect("/internal/analytics");
}
```

- [ ] **Step 5: Run navigation tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- navigation
```

Expected: `PASS`.

- [ ] **Step 6: Commit**

Run:

```bash
git add apps/portal/app/_lib/product/navigation.ts apps/portal/app/_lib/product/navigation.test.ts apps/portal/app/internal/pilot/metrics/page.tsx
git commit -m "feat(portal): add analytics navigation"
```

---

### Task 7: Full Verification And Local Review

**Files:**

- No new files unless verification finds a real defect.

- [ ] **Step 1: Run backend tests**

Run:

```bash
go test ./services/api/...
```

Expected: all API package tests pass.

- [ ] **Step 2: Verify SQLC output is current**

Run:

```bash
go run github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1 generate
git diff --exit-code services/api/internal/store/sqlc
```

Expected: SQLC command succeeds and `git diff --exit-code` exits `0`.

- [ ] **Step 3: Run portal tests**

Run:

```bash
npm run test --workspace @titlechain/portal
```

Expected: all portal tests pass.

- [ ] **Step 4: Run portal lint and build**

Run:

```bash
npm run lint --workspace @titlechain/portal
npm run build --workspace @titlechain/portal
```

Expected: lint and Next.js build complete successfully.

- [ ] **Step 5: Run the complete Docker stack**

Run:

```bash
docker compose --env-file .env -f infra/docker/docker-compose.yml up --build
```

Expected:

- `api-1` starts and listens on `:8080`.
- `portal-1` starts and listens on the configured portal port.
- `postgres-1` and `redis-1` stay running.
- No `address already in use` error. If Redis port `6379` is already used locally, stop the local Redis service or change the compose host port before re-running.

- [ ] **Step 6: Manually review in the browser**

Open the portal and verify:

- `/internal/analytics` loads for `demo@titlechain.co.za`.
- Operations navigation includes `Analytics`.
- Range links switch between `7d`, `30d`, `90d`, and `all`.
- Empty sections are calm and explicit on a seed database.
- Risk queue rows link to `/internal/cases/{case_id}`.
- `/internal/pilot/metrics` redirects to `/internal/analytics`.
- The visual style matches the product shell and does not look like the landing page.

- [ ] **Step 7: Commit verification fixes**

If verification required small fixes, commit them:

```bash
git add <changed-files>
git commit -m "test: verify titlechain intelligence analytics"
```

If no files changed after verification, skip this commit and leave the prior implementation commits as the branch history.

---

## Self-Review

Spec coverage:

- Internal-first analytics is covered by Tasks 1 through 6.
- Real data from existing product tables is covered by Task 2.
- `/api/internal/analytics/overview` is covered by Task 3.
- `/internal/analytics` product-shell UI is covered by Task 5.
- Navigation consistency and legacy metrics cleanup are covered by Task 6.
- Empty-state and no-fabricated-value behavior is covered in Task 5 component contracts and Task 7 manual review.
- Verification requirements are covered by Task 7.

Type consistency:

- Backend JSON keys in `analytics/types.go` match portal `types.ts`.
- Range keys are `7d`, `30d`, `90d`, and `all` in both Go and TypeScript.
- The route is consistently named `/api/internal/analytics/overview`.
- The portal page route is consistently named `/internal/analytics`.

Execution note:

- Because `docs/` is ignored in this repository, force-add this plan file when committing planning docs.
