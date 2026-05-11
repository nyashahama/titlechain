# TitleChain Intelligence Analytics Design

## Context

TitleChain now has a more coherent landing page and product shell, but the current metrics surface is still a narrow pilot-admin page at `/internal/pilot/metrics`. It reports a handful of counts from `pilot.matter_links`, `ops.case_records`, and `ops.case_decisions`, and it is not part of the primary Operations navigation.

The next product step is to turn that narrow page into **TitleChain Intelligence**: an internal analytics workspace that helps operators and pilot administrators understand legal verification flow, case risk, evidence coverage, and source-data reliability.

This should not become a generic dashboard with decorative charts. The system should answer operational questions that matter to conveyancing verification:

- What is blocked right now?
- Why are matters being sent to review or stopped?
- Which evidence sources are weak, conflicting, or missing?
- How long are matters waiting before resolution?
- Which decisions are being accepted, manually overridden, or reopened?
- Are ingestion and projection runs healthy enough to trust the visible product state?

## Reference Direction

Use the cloned/reference projects as design and workflow references, not as code to copy blindly.

- **Supabase Studio**: Dense operations surfaces, left navigation discipline, high-signal tables, status chips, filters near the data they affect, and developer-grade internal tooling.
- **OpenStatus**: Operational health summaries, incident/failure visibility, monitor-like status blocks, and a strong relationship between health signals and timelines.
- **Documenso**: Workflow lifecycle clarity, evidence/audit orientation, document status language, and completion-focused summaries.
- **PostHog**: Event-product thinking: trends, funnels, cohorts, and retention concepts. For TitleChain, this translates to case lifecycle and decision lifecycle analysis rather than marketing analytics.
- **Metabase and Grafana**: Secondary inspiration for queryable analytics, drill-down behavior, alert-worthy states, and visual hierarchy. Do not embed either product or introduce a BI dependency in the first implementation.
- **Twenty and Plane**: Secondary references for restrained SaaS operations UI, compact records, consistent navigation, and workflow-first information architecture.

## Product Decision

Build **internal/operator analytics first** at `/internal/analytics`.

Customer-facing analytics can come later after the internal data model has settled. Starting internally avoids leaking half-mature metrics to pilot customers and lets the team validate which analytics actually change operational decisions.

The existing `/internal/pilot/metrics` route should become a legacy alias or redirect, not a second analytics experience. The product should have one analytics home under Operations.

## Information Architecture

Add a new Operations navigation item:

- Label: `Analytics`
- Route: `/internal/analytics`
- Role: `pilot_admin`
- Icon: `BarChart3` from `lucide-react`

The page should use the existing product shell primitives:

- `ProductPage`
- `PageHeader`
- `ProductPanel`
- `DataToolbar`
- `StateView`
- `ProductStatusBadge`
- Existing table and detail-row patterns where available

The page should feel like the same product as `/dashboard`, `/matters`, `/internal/cases`, `/internal/properties`, and `/internal/ops/runs`. Avoid marketing-style cards, oversized typography, floating decorative panels, gradients, and fake visual polish that does not improve decision-making.

## Analytics Scope

### Phase 1: Internal Overview

The first analytics release should be a single internal overview page with these sections.

#### Operating Summary

Answers whether the pipeline is moving:

- Submitted matters
- Resolved matters
- In-review matters
- Reopened matters
- Closed unresolved matters
- Average time to resolve
- Oldest in-review age
- Manual overrides
- Accepted decision proposals

Use current `GetPilotMetrics` behavior as the base, but fold it into a broader analytics contract.

#### Decision Intelligence

Answers what the system and analysts are deciding:

- Current decision mix: `clear`, `review`, `stop`
- Decision source mix: proposal accepted by analyst, manual decision, system proposal
- Open cases without a current decision
- Resolved cases with manual overrides
- Reopened cases after a prior decision

The UI should show semantic bars and compact tables before adding a charting dependency.

#### Reason Intelligence

Answers why decisions are happening:

- Top reason codes
- Reason category mix: `hard_block`, `review`, `unresolved`
- Reason-code frequency by decision
- Manual-override reasons
- Unresolved-close reasons

Reason codes are the core legal explanation layer. They should be treated as first-class analytics, not secondary labels.

#### Evidence Coverage

Answers whether a case has enough defensible proof:

- Cases with no evidence
- Evidence status mix: `captured`, `confirmed`, `conflicting`, `superseded`
- Source type mix from `ops.case_evidence_items.source_type`
- Conflicting evidence count
- Average evidence items per case
- Cases with a decision but no confirmed evidence

This section should make it hard to confuse a completed workflow with a defensible workflow.

#### Source Health

Answers whether backend source processing is trustworthy:

- Latest ingestion/projection run status
- Failed jobs
- Pending jobs
- Latest error message
- Quarantined source rows
- Source links created
- Last successful run timestamp

This should connect to existing `ops.runs`, `ops.jobs`, raw/stage/core source tables, and the current runs page behavior.

#### Risk Queue

Answers what the team should look at next:

- Oldest matters in review
- Reopened matters
- Cases with `stop` or `review` decisions
- Cases with conflicting evidence
- Cases without confirmed evidence
- Failed source runs that may invalidate recent confidence

This should be a compact table with direct links to case detail pages. The page should not stop at aggregate metrics when the user needs a next action.

### Phase 2: Drill-Downs

After Phase 1 ships, add dedicated drill-downs only where the overview proves there is user value:

- `/internal/analytics/decisions`
- `/internal/analytics/evidence`
- `/internal/analytics/source-health`
- `/internal/analytics/reasons`

These should reuse the same API types and product-shell components rather than creating separate dashboard styles.

### Phase 3: Firm-Facing Reporting

After internal validation, expose a scoped firm/customer reporting view:

- Matter throughput for the signed-in organization
- Evidence completeness for that organization
- Resolution timing
- Summary-export history
- Reopened and unresolved counts

Customer-facing analytics must be organization-scoped from the first line of backend code. The current internal pilot metrics query is not enough for customer analytics because it intentionally aggregates across the pilot surface.

## Data Contract

Create a new internal API endpoint:

```http
GET /api/internal/analytics/overview?range=30d
```

Supported ranges:

- `7d`
- `30d`
- `90d`
- `all`

The backend should normalize the range into a server-side `from`/`to` window and return it in the response.

Proposed JSON shape:

```json
{
  "range": {
    "key": "30d",
    "from": "2026-04-12T00:00:00Z",
    "to": "2026-05-12T00:00:00Z"
  },
  "operating_summary": {
    "submitted_count": 12,
    "resolved_count": 8,
    "in_review_count": 2,
    "reopened_count": 1,
    "unresolved_count": 1,
    "average_seconds_to_resolve": 172800,
    "oldest_in_review_seconds": 86400,
    "accepted_proposal_count": 6,
    "manual_override_count": 2
  },
  "decision_mix": [
    { "decision": "clear", "count": 5, "manual_count": 1, "accepted_proposal_count": 4 }
  ],
  "reason_codes": [
    { "code": "party_mismatch", "label": "Party mismatch", "category": "hard_block", "count": 3 }
  ],
  "evidence": {
    "total_items": 20,
    "cases_without_evidence": 2,
    "cases_without_confirmed_evidence": 4,
    "status_mix": [{ "status": "confirmed", "count": 12 }],
    "source_type_mix": [{ "source_type": "deeds_office", "count": 10 }]
  },
  "source_health": {
    "latest_run_id": "uuid",
    "latest_run_status": "completed",
    "latest_error": "",
    "failed_job_count": 0,
    "pending_job_count": 1,
    "quarantined_record_count": 0,
    "source_link_count": 42,
    "last_successful_run_at": "2026-05-12T08:30:00Z"
  },
  "risk_queue": [
    {
      "case_id": "uuid",
      "case_reference": "TC-2026-0001",
      "status": "in_review",
      "customer_status": "in_review",
      "organization_name": "Hama & Associates Inc",
      "age_seconds": 86400,
      "risk_reasons": ["conflicting_evidence", "oldest_in_review"]
    }
  ]
}
```

The exact generated Go structs can use idiomatic naming, but the JSON keys should be explicit and stable.

## Data Source Rules

Phase 1 should derive analytics from authoritative product tables already in the repository:

- `pilot.matter_links`
- `pilot.organizations`
- `ops.case_records`
- `ops.case_decisions`
- `ops.case_decision_reason_codes`
- `ops.reason_codes`
- `ops.case_evidence_items`
- `ops.runs`
- `ops.jobs`
- `stage.quarantined_records`
- `core.source_links`

Do not introduce a separate analytics event table for Phase 1. The product does not yet need an event warehouse, and deriving from existing workflow tables keeps the first version auditable.

If a metric cannot be backed by current data, do not show it as a fake or hard-coded value. The UI should either omit it or display an empty state that names the missing data source.

## UI Behavior

The page should default to `30d` and allow switching between `7d`, `30d`, `90d`, and `all`.

Use server-rendered data for the initial page. Client interactivity should be limited to the range selector and local display refinements unless there is a clear need for a richer client state model.

Charts should be restrained:

- Use CSS bars, progress rows, and tables for Phase 1.
- Use accessible labels and visible numbers next to every visual encoding.
- Do not add a chart library until the dashboard needs time-series or multi-axis comparisons.
- Never render a chart with fabricated values.

## Permissions

Phase 1 is internal-only:

- The portal page lives under `/internal/analytics`.
- The page calls `requirePilotAdmin()`.
- The API route lives under `/api/internal/analytics/overview`.

Future firm-facing reporting must accept organization scope from the authenticated pilot user, not from a free-form query parameter.

## Empty And Error States

The analytics page must be useful on a fresh seed database.

Required states:

- No matters submitted yet
- Matters exist but no decisions yet
- Cases exist but no evidence yet
- No source runs yet
- Latest source run failed
- API unavailable

Use `StateView` for whole-section failures and compact empty rows for table-level empty states.

## Visual Standard

The page should look like 2026-grade product software:

- Compact, information-dense, and calm.
- High contrast between critical risk states and normal status states.
- Clear page hierarchy without landing-page styling.
- No decorative dashboard cards nested inside larger cards.
- No one-note purple/blue gradient theme.
- No inline custom SVG icon work when a `lucide-react` icon exists.
- No text overflow in metric tiles, filters, badges, tables, or buttons.

## Testing Requirements

Backend:

- Unit tests for analytics range normalization.
- Handler test for `/api/internal/analytics/overview`.
- Store mapping tests for SQLC rows into domain structs.
- Query-generation verification with `sqlc generate`.
- API test coverage for empty metrics and populated metrics.

Frontend:

- Type/format utility tests for duration, percentages, status labels, and range handling.
- Page or component tests for populated, empty, and failed states.
- Navigation tests confirming `Analytics` appears for `pilot_admin` and not regular pilot users.
- Product-quality guard coverage for the new route.

End-to-end local verification:

- `go test ./...` in `services/api`
- `npm run test --workspace @titlechain/portal`
- `npm run lint --workspace @titlechain/portal`
- `npm run build --workspace @titlechain/portal`
- `sqlc generate`
- `docker compose --env-file .env -f infra/docker/docker-compose.yml up --build`

## Non-Goals

Phase 1 does not include:

- Embedded Metabase, Grafana, PostHog, or any BI service.
- Predictive risk scoring.
- Revenue, billing, or usage analytics.
- Customer-facing analytics pages.
- CSV/PDF export.
- Long-term analytics warehouse.
- Analyst productivity scoring by individual.

## Risks

- The existing `GetPilotMetrics` query is internal and globally scoped. That is acceptable for Phase 1 internal analytics but must not be reused for firm-facing analytics without organization scoping.
- Some lifecycle questions need historical status transitions. The current model has audit events, created timestamps, and resolved timestamps, but not a dedicated status-history table. Phase 1 should be explicit where a metric is current-state analytics versus time-series analytics.
- Source-health analytics must distinguish job failure from product workflow failure. Failed ingestion can lower confidence in visible records without implying every case decision is wrong.
- The analytics page can become visually impressive but operationally weak if it over-indexes on charts. Keep every section tied to a decision the operator can make.

## Success Criteria

TitleChain Intelligence is successful when a pilot admin can open `/internal/analytics` and know within one minute:

- Whether the verification operation is healthy.
- Which matters need attention first.
- Which reason codes are driving risk.
- Whether evidence coverage supports the current decisions.
- Whether source ingestion and projection are reliable enough to trust the product state.

