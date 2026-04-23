# TitleChain Phase 1 Internal Decision Case Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable TitleChain product slice: an internal analyst-led console for creating one property matter at a time, capturing structured evidence, assigning ownership, and recording auditable `clear`, `review`, `stop`, or unresolved outcomes.

**Architecture:** Keep phase 1 inside the existing modular-monolith boundaries. Postgres stores cases, analysts, seeded property suggestions, reason codes, evidence, decisions, and audit events; the Go API owns workflow validation and persistence orchestration; the Next.js portal provides an internal analyst console through server-side API calls. The Rust worker is intentionally not on the phase-one critical path.

**Tech Stack:** PostgreSQL, goose, sqlc, Go 1.24, Chi, pgx/pgxpool, Next.js 16 App Router, React 19, TypeScript, Vitest, React Testing Library

---

## Implementation Boundaries

This plan implements only the approved phase-one spec:

- analyst-led internal console
- seeded data plus analyst-entered evidence
- manual property intake with seeded match suggestions
- explicit assignment and ownership
- structured evidence and notes only
- fixed reason-code catalog shipped with the app
- append-only decision history and immutable audit events

This plan does not implement:

- live external source integration
- file uploads
- public or private partner APIs
- batch checks
- customer login
- second-review approval rules
- customer-configurable reason codes
- fraud scoring models

## File Structure

### Database

- Create: `db/migrations/20260423100000_phase_1_cases.sql`
- Create: `db/queries/cases.sql`
- Modify after generation: `services/api/internal/store/sqlc/*`

### Go API

- Modify: `services/api/cmd/api/main.go`
- Modify: `services/api/internal/platform/config.go`
- Modify: `services/api/internal/http/router.go`
- Modify: `services/api/internal/http/router_test.go`
- Create: `services/api/internal/http/cases_handler.go`
- Create: `services/api/internal/http/cases_handler_test.go`
- Create: `services/api/internal/cases/types.go`
- Create: `services/api/internal/cases/reason_codes.go`
- Create: `services/api/internal/cases/service.go`
- Create: `services/api/internal/cases/service_test.go`
- Create: `services/api/internal/cases/repository.go`
- Create: `services/api/internal/cases/memory_repository_test.go`
- Create: `services/api/internal/store/cases.go`

### Portal

- Modify: `.env.example`
- Create: `apps/portal/app/internal/cases/types.ts`
- Create: `apps/portal/app/internal/cases/api.ts`
- Create: `apps/portal/app/internal/cases/actions.ts`
- Create: `apps/portal/app/internal/cases/page.tsx`
- Create: `apps/portal/app/internal/cases/new/page.tsx`
- Create: `apps/portal/app/internal/cases/[caseId]/page.tsx`
- Create: `apps/portal/app/internal/cases/_components/analyst-switcher.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-queue.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-intake-form.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-detail.tsx`
- Create: `apps/portal/app/internal/cases/_components/decision-form.tsx`
- Create: `apps/portal/app/internal/cases/_components/evidence-form.tsx`
- Create: `apps/portal/app/internal/cases/case-console.test.tsx`

## Shared API Contract

All phase-one routes live under `/api/internal`.

### Analyst Routes

- `GET /api/internal/analysts`
  Returns seeded analyst roster.

### Reason Code Routes

- `GET /api/internal/reason-codes`
  Returns the fixed reason-code catalog.

### Case Routes

- `GET /api/internal/cases`
  Query params: `status`, `assignee_id`, `queue`.
- `POST /api/internal/cases`
  Creates a case from manual property intake and auto-assigns it to the creating analyst.
- `GET /api/internal/cases/{caseID}`
  Returns full case detail.
- `POST /api/internal/cases/{caseID}/assignment`
  Reassigns ownership.
- `POST /api/internal/cases/{caseID}/property-match`
  Confirms or rejects a seeded property match.
- `POST /api/internal/cases/{caseID}/evidence`
  Adds immutable structured evidence.
- `POST /api/internal/cases/{caseID}/parties`
  Adds structured optional party detail.
- `POST /api/internal/cases/{caseID}/decision`
  Records `clear`, `review`, or `stop`.
- `POST /api/internal/cases/{caseID}/close-unresolved`
  Closes the case without a customer-facing decision.
- `POST /api/internal/cases/{caseID}/reopen`
  Reopens a resolved or unresolved case.

### Payload Shapes

Use these JSON shapes consistently across tests, handlers, portal code, and API documentation comments.

```json
{
  "actor_id": "ana-001",
  "property_description": "Erf 412 Rosebank Township",
  "locality_or_area": "Rosebank",
  "municipality_or_deeds_office": "Johannesburg",
  "title_reference": "T12345/2024",
  "matter_reference": "MAT-2026-001",
  "intake_note": "Seller file received for pre-lodgement verification."
}
```

```json
{
  "actor_id": "ana-001",
  "decision": "stop",
  "reason_codes": ["ACTIVE_INTERDICT"],
  "note": "The seeded evidence records an active interdict against transfer."
}
```

```json
{
  "actor_id": "ana-001",
  "evidence_type": "title_status",
  "source_type": "seeded_deeds_record",
  "source_reference": "SEED-DEEDS-001",
  "external_reference": "T12345/2024",
  "excerpt": "Title status indicates active transfer restriction.",
  "extracted_facts": {
    "restriction": "active_interdict",
    "title_reference": "T12345/2024"
  },
  "evidence_status": "confirmed",
  "analyst_note": "Matches property and title reference supplied during intake."
}
```

## Reason-Code Catalog

Seed this exact initial catalog in the phase-one migration:

| Code | Label | Category | Hard Block |
| --- | --- | --- | --- |
| `TITLE_SEARCH_CLEAN` | Title search found no material blocker | `clear_support` | false |
| `ENCUMBRANCE_CHECK_CLEAN` | Encumbrance check found no active blocker | `clear_support` | false |
| `OWNERSHIP_CHAIN_CONFIRMED` | Ownership chain aligns with supplied matter | `clear_support` | false |
| `ACTIVE_INTERDICT` | Active interdict or transfer restriction found | `hard_block` | true |
| `TITLE_DEED_MISMATCH` | Supplied title reference conflicts with evidence | `hard_block` | true |
| `REGISTERED_BOND_CONFLICT` | Registered bond or encumbrance conflicts with matter | `hard_block` | true |
| `OWNERSHIP_CONFLICT` | Current owner evidence conflicts with supplied matter | `review_trigger` | false |
| `PARTY_NAME_VARIANCE` | Party name or entity details require review | `review_trigger` | false |
| `SOURCE_CONFLICT` | Available sources disagree on material facts | `review_trigger` | false |
| `FRAUD_SIGNAL_PRESENT` | Fraud or anomaly signal requires review | `review_trigger` | false |
| `MISSING_TITLE_REFERENCE` | Title reference missing or unverifiable | `unresolved_information` | false |
| `INSUFFICIENT_SOURCE_COVERAGE` | Available evidence is insufficient for a defensible decision | `unresolved_information` | false |

## Task 1: Add Phase-One Database Schema And SQLC Queries

**Files:**

- Create: `db/migrations/20260423100000_phase_1_cases.sql`
- Create: `db/queries/cases.sql`
- Generate: `services/api/internal/store/sqlc/*`

- [ ] **Step 1: Verify current schema generation before changing it**

Run:

```bash
sqlc generate
```

Expected: PASS and no generated diff unrelated to this task.

- [ ] **Step 2: Create the phase-one migration**

Create `db/migrations/20260423100000_phase_1_cases.sql` with:

```sql
-- +goose Up
CREATE TABLE ops.analysts (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.reason_codes (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('clear_support', 'hard_block', 'review_trigger', 'unresolved_information')),
    is_hard_block BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.seed_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_description TEXT NOT NULL,
    locality_or_area TEXT NOT NULL,
    municipality_or_deeds_office TEXT NOT NULL,
    title_reference TEXT,
    current_owner_name TEXT,
    status_summary TEXT NOT NULL,
    seeded_risk JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference TEXT NOT NULL UNIQUE,
    property_description TEXT NOT NULL,
    locality_or_area TEXT NOT NULL,
    municipality_or_deeds_office TEXT NOT NULL,
    title_reference TEXT,
    matter_reference TEXT,
    intake_note TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'resolved', 'closed_unresolved', 'reopened')),
    assignee_id TEXT NOT NULL REFERENCES ops.analysts(id),
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    linked_seed_property_id UUID REFERENCES ops.seed_properties(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_property_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    seed_property_id UUID NOT NULL REFERENCES ops.seed_properties(id),
    match_source TEXT NOT NULL,
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    status TEXT NOT NULL CHECK (status IN ('candidate', 'confirmed', 'rejected')),
    confirmed_by TEXT REFERENCES ops.analysts(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer', 'conveyancer', 'other')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'company', 'unknown')),
    display_name TEXT NOT NULL,
    identifier TEXT,
    note TEXT,
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    external_reference TEXT,
    excerpt TEXT,
    extracted_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_status TEXT NOT NULL CHECK (evidence_status IN ('captured', 'confirmed', 'conflicting', 'superseded')),
    analyst_note TEXT,
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('clear', 'review', 'stop')),
    note TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    superseded_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX case_decisions_one_current_per_case
    ON ops.case_decisions(case_id)
    WHERE status = 'current';

CREATE TABLE ops.case_decision_reason_codes (
    decision_id UUID NOT NULL REFERENCES ops.case_decisions(id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL REFERENCES ops.reason_codes(code),
    PRIMARY KEY (decision_id, reason_code)
);

CREATE TABLE ops.case_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL REFERENCES ops.analysts(id),
    event_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX case_records_status_idx ON ops.case_records(status);
CREATE INDEX case_records_assignee_idx ON ops.case_records(assignee_id);
CREATE INDEX case_property_matches_case_idx ON ops.case_property_matches(case_id);
CREATE INDEX case_evidence_items_case_idx ON ops.case_evidence_items(case_id);
CREATE INDEX case_parties_case_idx ON ops.case_parties(case_id);
CREATE INDEX case_audit_events_case_idx ON ops.case_audit_events(case_id, created_at DESC);

INSERT INTO ops.analysts (id, display_name, email) VALUES
    ('ana-001', 'Nyasha Hama', 'nyasha@titlechain.local'),
    ('ana-002', 'Amina Patel', 'amina@titlechain.local'),
    ('ana-003', 'Thabo Mokoena', 'thabo@titlechain.local');

INSERT INTO ops.reason_codes (code, label, category, is_hard_block, sort_order) VALUES
    ('TITLE_SEARCH_CLEAN', 'Title search found no material blocker', 'clear_support', FALSE, 10),
    ('ENCUMBRANCE_CHECK_CLEAN', 'Encumbrance check found no active blocker', 'clear_support', FALSE, 20),
    ('OWNERSHIP_CHAIN_CONFIRMED', 'Ownership chain aligns with supplied matter', 'clear_support', FALSE, 30),
    ('ACTIVE_INTERDICT', 'Active interdict or transfer restriction found', 'hard_block', TRUE, 100),
    ('TITLE_DEED_MISMATCH', 'Supplied title reference conflicts with evidence', 'hard_block', TRUE, 110),
    ('REGISTERED_BOND_CONFLICT', 'Registered bond or encumbrance conflicts with matter', 'hard_block', TRUE, 120),
    ('OWNERSHIP_CONFLICT', 'Current owner evidence conflicts with supplied matter', 'review_trigger', FALSE, 200),
    ('PARTY_NAME_VARIANCE', 'Party name or entity details require review', 'review_trigger', FALSE, 210),
    ('SOURCE_CONFLICT', 'Available sources disagree on material facts', 'review_trigger', FALSE, 220),
    ('FRAUD_SIGNAL_PRESENT', 'Fraud or anomaly signal requires review', 'review_trigger', FALSE, 230),
    ('MISSING_TITLE_REFERENCE', 'Title reference missing or unverifiable', 'unresolved_information', FALSE, 300),
    ('INSUFFICIENT_SOURCE_COVERAGE', 'Available evidence is insufficient for a defensible decision', 'unresolved_information', FALSE, 310);

INSERT INTO ops.seed_properties (
    property_description,
    locality_or_area,
    municipality_or_deeds_office,
    title_reference,
    current_owner_name,
    status_summary,
    seeded_risk
) VALUES
    ('Erf 412 Rosebank Township', 'Rosebank', 'Johannesburg', 'T12345/2024', 'Maseko Family Trust', 'No material blocker seeded', '{"scenario":"clear"}'::jsonb),
    ('Section 8 SS Harbor View', 'Umhlanga', 'Durban', 'ST7788/2023', 'Harbor View Holdings Pty Ltd', 'Ownership variance seeded', '{"scenario":"review","signal":"ownership_conflict"}'::jsonb),
    ('Erf 91 Observatory', 'Observatory', 'Cape Town', 'T9988/2022', 'Ndlovu Property Holdings', 'Active interdict seeded', '{"scenario":"stop","blocker":"active_interdict"}'::jsonb),
    ('Farm Portion 17 Rietfontein', 'Rietfontein', 'Pretoria', NULL, 'Unknown', 'Insufficient title reference seeded', '{"scenario":"unresolved","missing":"title_reference"}'::jsonb);

-- +goose Down
DROP TABLE IF EXISTS ops.case_audit_events;
DROP TABLE IF EXISTS ops.case_decision_reason_codes;
DROP TABLE IF EXISTS ops.case_decisions;
DROP TABLE IF EXISTS ops.case_evidence_items;
DROP TABLE IF EXISTS ops.case_parties;
DROP TABLE IF EXISTS ops.case_property_matches;
DROP TABLE IF EXISTS ops.case_records;
DROP TABLE IF EXISTS ops.seed_properties;
DROP TABLE IF EXISTS ops.reason_codes;
DROP TABLE IF EXISTS ops.analysts;
```

- [ ] **Step 3: Create SQLC queries**

Create `db/queries/cases.sql` with queries covering these names and responsibilities:

```sql
-- name: ListAnalysts :many
SELECT id, display_name, email, active, created_at
FROM ops.analysts
WHERE active = TRUE
ORDER BY display_name;

-- name: GetAnalyst :one
SELECT id, display_name, email, active, created_at
FROM ops.analysts
WHERE id = $1 AND active = TRUE;

-- name: ListReasonCodes :many
SELECT code, label, category, is_hard_block, active, sort_order, created_at
FROM ops.reason_codes
WHERE active = TRUE
ORDER BY sort_order;

-- name: CreateCaseRecord :one
INSERT INTO ops.case_records (
    case_reference,
    property_description,
    locality_or_area,
    municipality_or_deeds_office,
    title_reference,
    matter_reference,
    intake_note,
    status,
    assignee_id,
    created_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, $8)
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: ListSeedPropertyMatches :many
SELECT id, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, current_owner_name, status_summary, seeded_risk, created_at
FROM ops.seed_properties
WHERE lower(property_description) LIKE '%' || lower($1) || '%'
   OR lower(locality_or_area) LIKE '%' || lower($2) || '%'
   OR lower(municipality_or_deeds_office) LIKE '%' || lower($3) || '%'
ORDER BY
    CASE WHEN lower(property_description) = lower($1) THEN 0 ELSE 1 END,
    created_at
LIMIT 5;

-- name: CreatePropertyMatch :one
INSERT INTO ops.case_property_matches (case_id, seed_property_id, match_source, confidence, status)
VALUES ($1, $2, $3, $4, 'candidate')
RETURNING id, case_id, seed_property_id, match_source, confidence, status, confirmed_by, confirmed_at, created_at;

-- name: ListCaseSummaries :many
SELECT id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at
FROM ops.case_records
WHERE (sqlc.narg('status')::text IS NULL OR status = sqlc.narg('status')::text)
  AND (sqlc.narg('assignee_id')::text IS NULL OR assignee_id = sqlc.narg('assignee_id')::text)
ORDER BY updated_at DESC
LIMIT sqlc.arg('limit');

-- name: GetCaseRecord :one
SELECT id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at
FROM ops.case_records
WHERE id = $1;

-- name: ListCasePropertyMatches :many
SELECT id, case_id, seed_property_id, match_source, confidence, status, confirmed_by, confirmed_at, created_at
FROM ops.case_property_matches
WHERE case_id = $1
ORDER BY confidence DESC, created_at;

-- name: RejectCasePropertyMatches :exec
UPDATE ops.case_property_matches
SET status = 'rejected'
WHERE case_id = $1 AND status = 'candidate';

-- name: ConfirmCasePropertyMatch :one
UPDATE ops.case_property_matches
SET status = 'confirmed', confirmed_by = $3, confirmed_at = NOW()
WHERE case_id = $1 AND id = $2
RETURNING id, case_id, seed_property_id, match_source, confidence, status, confirmed_by, confirmed_at, created_at;

-- name: LinkCaseSeedProperty :one
UPDATE ops.case_records
SET linked_seed_property_id = $2, status = 'in_review', updated_at = NOW()
WHERE id = $1
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: AddCaseEvidence :one
INSERT INTO ops.case_evidence_items (
    case_id, evidence_type, source_type, source_reference, external_reference,
    excerpt, extracted_facts, evidence_status, analyst_note, created_by
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, case_id, evidence_type, source_type, source_reference, external_reference,
    excerpt, extracted_facts, evidence_status, analyst_note, created_by, created_at;

-- name: ListCaseEvidence :many
SELECT id, case_id, evidence_type, source_type, source_reference, external_reference,
    excerpt, extracted_facts, evidence_status, analyst_note, created_by, created_at
FROM ops.case_evidence_items
WHERE case_id = $1
ORDER BY created_at DESC;

-- name: AddCaseParty :one
INSERT INTO ops.case_parties (case_id, role, entity_type, display_name, identifier, note, created_by)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, case_id, role, entity_type, display_name, identifier, note, created_by, created_at;

-- name: ListCaseParties :many
SELECT id, case_id, role, entity_type, display_name, identifier, note, created_by, created_at
FROM ops.case_parties
WHERE case_id = $1
ORDER BY created_at DESC;

-- name: ReassignCase :one
UPDATE ops.case_records
SET assignee_id = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: SupersedeCurrentDecisions :exec
UPDATE ops.case_decisions
SET status = 'superseded', superseded_at = NOW()
WHERE case_id = $1 AND status = 'current';

-- name: CreateCaseDecision :one
INSERT INTO ops.case_decisions (case_id, decision, note, status, created_by)
VALUES ($1, $2, $3, 'current', $4)
RETURNING id, case_id, decision, note, status, created_by, created_at, superseded_at;

-- name: AddDecisionReasonCode :exec
INSERT INTO ops.case_decision_reason_codes (decision_id, reason_code)
VALUES ($1, $2);

-- name: ResolveCase :one
UPDATE ops.case_records
SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
WHERE id = $1
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: CloseCaseUnresolved :one
UPDATE ops.case_records
SET status = 'closed_unresolved', resolved_at = NOW(), updated_at = NOW()
WHERE id = $1
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: ReopenCase :one
UPDATE ops.case_records
SET status = 'reopened', resolved_at = NULL, updated_at = NOW()
WHERE id = $1
RETURNING id, case_reference, property_description, locality_or_area, municipality_or_deeds_office,
    title_reference, matter_reference, intake_note, status, assignee_id, created_by,
    linked_seed_property_id, resolved_at, created_at, updated_at;

-- name: ListCaseDecisions :many
SELECT id, case_id, decision, note, status, created_by, created_at, superseded_at
FROM ops.case_decisions
WHERE case_id = $1
ORDER BY created_at DESC;

-- name: ListDecisionReasonCodes :many
SELECT drr.decision_id, rc.code, rc.label, rc.category, rc.is_hard_block, rc.active, rc.sort_order, rc.created_at
FROM ops.case_decision_reason_codes drr
JOIN ops.reason_codes rc ON rc.code = drr.reason_code
WHERE drr.decision_id = $1
ORDER BY rc.sort_order;

-- name: CreateCaseAuditEvent :one
INSERT INTO ops.case_audit_events (case_id, actor_id, event_type, metadata)
VALUES ($1, $2, $3, $4)
RETURNING id, case_id, actor_id, event_type, metadata, created_at;

-- name: ListCaseAuditEvents :many
SELECT id, case_id, actor_id, event_type, metadata, created_at
FROM ops.case_audit_events
WHERE case_id = $1
ORDER BY created_at DESC;
```

- [ ] **Step 4: Generate SQLC output**

Run:

```bash
sqlc generate
```

Expected: PASS and generated Go files under `services/api/internal/store/sqlc` include the new case and reason-code query methods.

- [ ] **Step 5: Validate the migration shape**

Run:

```bash
goose -dir db/migrations postgres "$DATABASE_URL" status
```

Expected: PASS when Postgres is running. If Postgres is not running, start it with `docker compose -f infra/docker/docker-compose.yml up -d postgres` and rerun the command.

- [ ] **Step 6: Commit database and generated query contracts**

Run:

```bash
git add db/migrations/20260423100000_phase_1_cases.sql db/queries/cases.sql services/api/internal/store/sqlc
git commit -m "feat: add phase one case workflow schema"
```

## Task 2: Add Go Case Domain Types, Repository Contract, And Validation Service

**Files:**

- Create: `services/api/internal/cases/types.go`
- Create: `services/api/internal/cases/reason_codes.go`
- Create: `services/api/internal/cases/repository.go`
- Create: `services/api/internal/cases/service.go`
- Create: `services/api/internal/cases/service_test.go`
- Create: `services/api/internal/cases/memory_repository_test.go`

- [ ] **Step 1: Write failing service tests**

Create `services/api/internal/cases/service_test.go` with tests named:

```go
func TestService_CreateCaseAutoAssignsActorAndCreatesAuditEvent(t *testing.T)
func TestService_RecordDecisionRejectsStopWithoutHardBlock(t *testing.T)
func TestService_RecordDecisionAllowsStopWithHardBlock(t *testing.T)
func TestService_RecordDecisionRejectsClearWithHardBlock(t *testing.T)
func TestService_CloseUnresolvedRequiresUnresolvedReasonAndNote(t *testing.T)
func TestService_ReassignCaseCreatesAuditEvent(t *testing.T)
```

Each test should use `newMemoryRepository()` from `memory_repository_test.go`, seed analysts and reason codes from the phase-one catalog, call the service method, and assert both returned state and audit events.

Run:

```bash
cd services/api && go test ./internal/cases -run TestService -count=1
```

Expected: FAIL because the `cases` package does not exist yet.

- [ ] **Step 2: Define domain types**

Create `services/api/internal/cases/types.go` with these public enum values and request/response structs:

```go
package cases

import "time"

type CaseStatus string

const (
	CaseStatusOpen             CaseStatus = "open"
	CaseStatusInReview         CaseStatus = "in_review"
	CaseStatusResolved         CaseStatus = "resolved"
	CaseStatusClosedUnresolved CaseStatus = "closed_unresolved"
	CaseStatusReopened         CaseStatus = "reopened"
)

type DecisionOutcome string

const (
	DecisionClear  DecisionOutcome = "clear"
	DecisionReview DecisionOutcome = "review"
	DecisionStop   DecisionOutcome = "stop"
)

type ReasonCategory string

const (
	ReasonCategoryClearSupport          ReasonCategory = "clear_support"
	ReasonCategoryHardBlock             ReasonCategory = "hard_block"
	ReasonCategoryReviewTrigger         ReasonCategory = "review_trigger"
	ReasonCategoryUnresolvedInformation ReasonCategory = "unresolved_information"
)

type EvidenceStatus string

const (
	EvidenceStatusCaptured    EvidenceStatus = "captured"
	EvidenceStatusConfirmed   EvidenceStatus = "confirmed"
	EvidenceStatusConflicting EvidenceStatus = "conflicting"
	EvidenceStatusSuperseded  EvidenceStatus = "superseded"
)

type Analyst struct {
	ID          string    `json:"id"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
}

type ReasonCode struct {
	Code        string         `json:"code"`
	Label       string         `json:"label"`
	Category    ReasonCategory `json:"category"`
	IsHardBlock bool           `json:"is_hard_block"`
	Active      bool           `json:"active"`
	SortOrder   int32          `json:"sort_order"`
}

type CaseSummary struct {
	ID                         string     `json:"id"`
	CaseReference              string     `json:"case_reference"`
	PropertyDescription        string     `json:"property_description"`
	LocalityOrArea             string     `json:"locality_or_area"`
	MunicipalityOrDeedsOffice  string     `json:"municipality_or_deeds_office"`
	TitleReference             string     `json:"title_reference,omitempty"`
	MatterReference            string     `json:"matter_reference,omitempty"`
	Status                     CaseStatus `json:"status"`
	AssigneeID                 string     `json:"assignee_id"`
	CreatedBy                  string     `json:"created_by"`
	LinkedSeedPropertyID        string     `json:"linked_seed_property_id,omitempty"`
	CreatedAt                  time.Time  `json:"created_at"`
	UpdatedAt                  time.Time  `json:"updated_at"`
}

type CreateCaseRequest struct {
	ActorID                    string `json:"actor_id"`
	PropertyDescription        string `json:"property_description"`
	LocalityOrArea             string `json:"locality_or_area"`
	MunicipalityOrDeedsOffice  string `json:"municipality_or_deeds_office"`
	TitleReference             string `json:"title_reference"`
	MatterReference            string `json:"matter_reference"`
	IntakeNote                 string `json:"intake_note"`
}

type RecordDecisionRequest struct {
	ActorID     string          `json:"actor_id"`
	Decision    DecisionOutcome `json:"decision"`
	ReasonCodes []string        `json:"reason_codes"`
	Note        string          `json:"note"`
}

type ListCasesFilter struct {
	Status     string
	AssigneeID string
	Limit      int32
}

type SeedProperty struct {
	ID                         string         `json:"id"`
	PropertyDescription        string         `json:"property_description"`
	LocalityOrArea             string         `json:"locality_or_area"`
	MunicipalityOrDeedsOffice  string         `json:"municipality_or_deeds_office"`
	TitleReference             string         `json:"title_reference,omitempty"`
	CurrentOwnerName           string         `json:"current_owner_name,omitempty"`
	StatusSummary              string         `json:"status_summary"`
	SeededRisk                 map[string]any `json:"seeded_risk"`
}

type PropertyMatch struct {
	ID             string    `json:"id"`
	CaseID         string    `json:"case_id"`
	SeedPropertyID string    `json:"seed_property_id"`
	MatchSource    string    `json:"match_source"`
	Confidence     float64   `json:"confidence"`
	Status         string    `json:"status"`
	ConfirmedBy    string    `json:"confirmed_by,omitempty"`
	ConfirmedAt    time.Time `json:"confirmed_at,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type ConfirmPropertyMatchRequest struct {
	ActorID string `json:"actor_id"`
	MatchID string `json:"match_id"`
	Action  string `json:"action"`
}

type EvidenceItem struct {
	ID                string         `json:"id"`
	CaseID            string         `json:"case_id"`
	EvidenceType      string         `json:"evidence_type"`
	SourceType        string         `json:"source_type"`
	SourceReference   string         `json:"source_reference"`
	ExternalReference string         `json:"external_reference,omitempty"`
	Excerpt           string         `json:"excerpt,omitempty"`
	ExtractedFacts    map[string]any `json:"extracted_facts"`
	EvidenceStatus    EvidenceStatus `json:"evidence_status"`
	AnalystNote       string         `json:"analyst_note,omitempty"`
	CreatedBy         string         `json:"created_by"`
	CreatedAt         time.Time      `json:"created_at"`
}

type AddEvidenceRequest struct {
	ActorID           string         `json:"actor_id"`
	EvidenceType      string         `json:"evidence_type"`
	SourceType        string         `json:"source_type"`
	SourceReference   string         `json:"source_reference"`
	ExternalReference string         `json:"external_reference"`
	Excerpt           string         `json:"excerpt"`
	ExtractedFacts    map[string]any `json:"extracted_facts"`
	EvidenceStatus    EvidenceStatus `json:"evidence_status"`
	AnalystNote       string         `json:"analyst_note"`
}

type Party struct {
	ID          string    `json:"id"`
	CaseID      string    `json:"case_id"`
	Role        string    `json:"role"`
	EntityType  string    `json:"entity_type"`
	DisplayName string    `json:"display_name"`
	Identifier  string    `json:"identifier,omitempty"`
	Note        string    `json:"note,omitempty"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

type AddPartyRequest struct {
	ActorID     string `json:"actor_id"`
	Role        string `json:"role"`
	EntityType  string `json:"entity_type"`
	DisplayName string `json:"display_name"`
	Identifier  string `json:"identifier"`
	Note        string `json:"note"`
}

type Decision struct {
	ID          string          `json:"id"`
	CaseID      string          `json:"case_id"`
	Decision    DecisionOutcome `json:"decision"`
	ReasonCodes []ReasonCode    `json:"reason_codes"`
	Note        string          `json:"note"`
	Status      string          `json:"status"`
	CreatedBy   string          `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
}

type CloseUnresolvedRequest struct {
	ActorID     string   `json:"actor_id"`
	ReasonCodes []string `json:"reason_codes"`
	Note        string   `json:"note"`
}

type ReassignCaseRequest struct {
	ActorID    string `json:"actor_id"`
	AssigneeID string `json:"assignee_id"`
	Note       string `json:"note"`
}

type ReopenCaseRequest struct {
	ActorID string `json:"actor_id"`
	Note    string `json:"note"`
}

type AuditEvent struct {
	ID        string         `json:"id"`
	CaseID    string         `json:"case_id"`
	ActorID   string         `json:"actor_id"`
	EventType string         `json:"event_type"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}

type CaseDetail struct {
	Case        CaseSummary    `json:"case"`
	Matches     []PropertyMatch `json:"matches"`
	Evidence    []EvidenceItem  `json:"evidence"`
	Parties     []Party         `json:"parties"`
	Decisions   []Decision      `json:"decisions"`
	AuditEvents []AuditEvent    `json:"audit_events"`
}
```

- [ ] **Step 3: Define fixed catalog helpers**

Create `services/api/internal/cases/reason_codes.go` with:

```go
package cases

var FixedReasonCodes = []ReasonCode{
	{Code: "TITLE_SEARCH_CLEAN", Label: "Title search found no material blocker", Category: ReasonCategoryClearSupport, SortOrder: 10},
	{Code: "ENCUMBRANCE_CHECK_CLEAN", Label: "Encumbrance check found no active blocker", Category: ReasonCategoryClearSupport, SortOrder: 20},
	{Code: "OWNERSHIP_CHAIN_CONFIRMED", Label: "Ownership chain aligns with supplied matter", Category: ReasonCategoryClearSupport, SortOrder: 30},
	{Code: "ACTIVE_INTERDICT", Label: "Active interdict or transfer restriction found", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 100},
	{Code: "TITLE_DEED_MISMATCH", Label: "Supplied title reference conflicts with evidence", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 110},
	{Code: "REGISTERED_BOND_CONFLICT", Label: "Registered bond or encumbrance conflicts with matter", Category: ReasonCategoryHardBlock, IsHardBlock: true, SortOrder: 120},
	{Code: "OWNERSHIP_CONFLICT", Label: "Current owner evidence conflicts with supplied matter", Category: ReasonCategoryReviewTrigger, SortOrder: 200},
	{Code: "PARTY_NAME_VARIANCE", Label: "Party name or entity details require review", Category: ReasonCategoryReviewTrigger, SortOrder: 210},
	{Code: "SOURCE_CONFLICT", Label: "Available sources disagree on material facts", Category: ReasonCategoryReviewTrigger, SortOrder: 220},
	{Code: "FRAUD_SIGNAL_PRESENT", Label: "Fraud or anomaly signal requires review", Category: ReasonCategoryReviewTrigger, SortOrder: 230},
	{Code: "MISSING_TITLE_REFERENCE", Label: "Title reference missing or unverifiable", Category: ReasonCategoryUnresolvedInformation, SortOrder: 300},
	{Code: "INSUFFICIENT_SOURCE_COVERAGE", Label: "Available evidence is insufficient for a defensible decision", Category: ReasonCategoryUnresolvedInformation, SortOrder: 310},
}
```

- [ ] **Step 4: Define repository interface**

Create `services/api/internal/cases/repository.go` with a `Repository` interface used by the service. It must include read methods for analysts, reason codes, case lists, and case detail, plus atomic workflow write methods for creation, property-match confirmation, evidence, parties, assignment, decisions, unresolved closure, and reopen. Use domain types from `types.go`, not sqlc models.

The repository should expose full workflow write methods rather than forcing the service to stitch together multiple writes without a transaction. The service owns validation; the repository owns atomic persistence.

Required method names:

```go
ListAnalysts(ctx context.Context) ([]Analyst, error)
ListReasonCodes(ctx context.Context) ([]ReasonCode, error)
ListCases(ctx context.Context, filter ListCasesFilter) ([]CaseSummary, error)
GetCaseDetail(ctx context.Context, caseID string) (CaseDetail, error)
CreateCaseWorkflow(ctx context.Context, req CreateCaseRequest, caseReference string) (CaseDetail, error)
ConfirmPropertyMatchWorkflow(ctx context.Context, caseID string, req ConfirmPropertyMatchRequest) (CaseDetail, error)
AddEvidenceWorkflow(ctx context.Context, caseID string, req AddEvidenceRequest) (CaseDetail, error)
AddPartyWorkflow(ctx context.Context, caseID string, req AddPartyRequest) (CaseDetail, error)
ReassignCaseWorkflow(ctx context.Context, caseID string, req ReassignCaseRequest) (CaseDetail, error)
RecordDecisionWorkflow(ctx context.Context, caseID string, req RecordDecisionRequest) (CaseDetail, error)
CloseUnresolvedWorkflow(ctx context.Context, caseID string, req CloseUnresolvedRequest) (CaseDetail, error)
ReopenCaseWorkflow(ctx context.Context, caseID string, req ReopenCaseRequest) (CaseDetail, error)
```

- [ ] **Step 5: Implement service validations**

Create `services/api/internal/cases/service.go` with a `Service` type that accepts a `Repository` and implements:

```go
func NewService(repo Repository) Service
func (s Service) ListAnalysts(ctx context.Context) ([]Analyst, error)
func (s Service) ListReasonCodes(ctx context.Context) ([]ReasonCode, error)
func (s Service) CreateCase(ctx context.Context, req CreateCaseRequest) (CaseDetail, error)
func (s Service) ListCases(ctx context.Context, filter ListCasesFilter) ([]CaseSummary, error)
func (s Service) GetCaseDetail(ctx context.Context, caseID string) (CaseDetail, error)
func (s Service) ConfirmPropertyMatch(ctx context.Context, caseID string, req ConfirmPropertyMatchRequest) (CaseDetail, error)
func (s Service) AddEvidence(ctx context.Context, caseID string, req AddEvidenceRequest) (CaseDetail, error)
func (s Service) AddParty(ctx context.Context, caseID string, req AddPartyRequest) (CaseDetail, error)
func (s Service) ReassignCase(ctx context.Context, caseID string, req ReassignCaseRequest) (CaseDetail, error)
func (s Service) RecordDecision(ctx context.Context, caseID string, req RecordDecisionRequest) (CaseDetail, error)
func (s Service) CloseUnresolved(ctx context.Context, caseID string, req CloseUnresolvedRequest) (CaseDetail, error)
func (s Service) ReopenCase(ctx context.Context, caseID string, req ReopenCaseRequest) (CaseDetail, error)
```

Validation rules:

- `actor_id`, `property_description`, `locality_or_area`, and `municipality_or_deeds_office` are required on create.
- `AddEvidenceRequest` requires `actor_id`, `evidence_type`, `source_type`, `source_reference`, and valid `evidence_status`.
- `RecordDecisionRequest` requires `actor_id`, one or more reason codes, and a non-empty note.
- `clear` accepts only `clear_support` reason codes.
- `review` accepts only `review_trigger` and `unresolved_information` reason codes.
- `stop` requires at least one `hard_block` reason code and may include `review_trigger` reason codes.
- unresolved closure requires one or more `unresolved_information` reason codes and a non-empty note.
- reassignment requires a valid `actor_id` and `assignee_id`.

Audit event names:

```go
const (
	AuditCaseCreated            = "case_created"
	AuditPropertyMatchConfirmed = "property_match_confirmed"
	AuditPropertyMatchRejected  = "property_match_rejected"
	AuditAssigneeChanged        = "assignee_changed"
	AuditEvidenceAdded          = "evidence_added"
	AuditPartyAdded             = "party_added"
	AuditDecisionRecorded       = "decision_recorded"
	AuditCaseClosedUnresolved   = "case_closed_unresolved"
	AuditCaseReopened           = "case_reopened"
)
```

- [ ] **Step 6: Implement the memory repository used by service tests**

Create `services/api/internal/cases/memory_repository_test.go`. The memory repository should preserve cases, reason codes, analysts, evidence, decisions, matches, and audit events in maps/slices. It only needs to satisfy service tests; it must not be used by production code.

- [ ] **Step 7: Run service tests**

Run:

```bash
cd services/api && go test ./internal/cases -count=1
```

Expected: PASS.

- [ ] **Step 8: Commit domain and service layer**

Run:

```bash
git add services/api/internal/cases
git commit -m "feat: add case workflow domain service"
```

## Task 3: Add SQLC-Backed Case Store And API Wiring

**Files:**

- Modify: `services/api/internal/platform/config.go`
- Modify: `services/api/cmd/api/main.go`
- Create: `services/api/internal/store/cases.go`
- Modify: `services/api/internal/http/router.go`
- Create: `services/api/internal/http/cases_handler.go`
- Modify: `services/api/internal/http/router_test.go`
- Create: `services/api/internal/http/cases_handler_test.go`

- [ ] **Step 1: Write failing handler tests**

Create `services/api/internal/http/cases_handler_test.go` with tests named:

```go
func TestCasesHandler_CreateCaseReturnsCreatedDetail(t *testing.T)
func TestCasesHandler_RecordDecisionRejectsInvalidStop(t *testing.T)
func TestCasesHandler_CloseUnresolvedReturnsDetail(t *testing.T)
func TestCasesHandler_ListReasonCodes(t *testing.T)
func TestCasesHandler_ReassignCase(t *testing.T)
```

Tests should start the router with a fake `cases.Service` backed by the memory repository from the cases test package pattern copied locally into the HTTP test file. Run:

```bash
cd services/api && go test ./internal/http -run TestCasesHandler -count=1
```

Expected: FAIL because the handler does not exist.

- [ ] **Step 2: Extend config for database connection**

Modify `services/api/internal/platform/config.go` so `Config` contains:

```go
type Config struct {
	HTTPAddr    string
	DatabaseURL string
}
```

`LoadConfig` should read `DATABASE_URL` and default to:

```text
postgres://titlechain:titlechain@localhost:5432/titlechain?sslmode=disable
```

- [ ] **Step 3: Add SQLC-backed repository**

Create `services/api/internal/store/cases.go`.

The store should:

- accept `*pgxpool.Pool`
- implement `cases.Repository`
- create `sqlc.Queries` from the pool for reads
- use `pool.Begin(ctx)` and `queries.WithTx(tx)` for every workflow method that writes more than one row
- convert sqlc models into domain types
- use JSONB values for extracted facts and audit metadata
- return typed validation-friendly errors when sqlc returns no rows

Required constructor:

```go
func NewCasesStore(pool *pgxpool.Pool) CasesStore
```

Required compile-time assertion:

```go
var _ cases.Repository = CasesStore{}
```

- [ ] **Step 4: Wire database connection in API main**

Modify `services/api/cmd/api/main.go` to:

- load `DatabaseURL`
- create a `pgxpool.Pool`
- defer `pool.Close()`
- create `store.NewCasesStore(pool)`
- create `cases.NewService(casesStore)`
- pass the service into the router

Keep `/healthz`, `/readyz`, and `/metrics`.

- [ ] **Step 5: Refactor router dependencies**

Modify `services/api/internal/http/router.go` to expose:

```go
type RouterDeps struct {
	Cases cases.Service
}

func NewRouter(deps RouterDeps) stdhttp.Handler
```

For tests that only check health routes, create a test service backed by memory repository rather than allowing nil dependencies.

- [ ] **Step 6: Implement cases handler**

Create `services/api/internal/http/cases_handler.go` with:

```go
type casesHandler struct {
	service cases.Service
}
```

Register routes:

```go
r.Get("/analysts", handler.listAnalysts)
r.Get("/reason-codes", handler.listReasonCodes)
r.Get("/cases", handler.listCases)
r.Post("/cases", handler.createCase)
r.Get("/cases/{caseID}", handler.getCase)
r.Post("/cases/{caseID}/assignment", handler.reassignCase)
r.Post("/cases/{caseID}/property-match", handler.confirmPropertyMatch)
r.Post("/cases/{caseID}/evidence", handler.addEvidence)
r.Post("/cases/{caseID}/parties", handler.addParty)
r.Post("/cases/{caseID}/decision", handler.recordDecision)
r.Post("/cases/{caseID}/close-unresolved", handler.closeUnresolved)
r.Post("/cases/{caseID}/reopen", handler.reopenCase)
```

Response behavior:

- `POST /cases` returns `201 Created`.
- validation failures return `400 Bad Request`.
- unknown case ids return `404 Not Found`.
- successful writes return the updated resource.
- responses use `application/json`.

- [ ] **Step 7: Keep existing legacy routes until replaced by portal**

Keep `/api/internal/portal/properties` and `/api/internal/ops/runs` working for now. Do not delete existing `property` and `jobs` package routes in this task.

- [ ] **Step 8: Run API tests**

Run:

```bash
cd services/api && go test ./...
```

Expected: PASS.

- [ ] **Step 9: Commit API wiring**

Run:

```bash
git add services/api
git commit -m "feat: expose internal case workflow API"
```

## Task 4: Add Benchmark Fixtures And Integration Verification

**Files:**

- Create: `services/api/internal/cases/fixtures_test.go`
- Create: `services/api/internal/cases/benchmark_workflow_test.go`
- Modify: `README.md`

- [ ] **Step 1: Add benchmark fixture helpers**

Create `services/api/internal/cases/fixtures_test.go` with helper functions:

```go
func cleanCaseRequest() CreateCaseRequest
func reviewCaseRequest() CreateCaseRequest
func stopCaseRequest() CreateCaseRequest
func unresolvedCaseRequest() CreateCaseRequest
```

Use seeded examples from the migration:

- `Erf 412 Rosebank Township` for clear
- `Section 8 SS Harbor View` for review
- `Erf 91 Observatory` for stop
- `Farm Portion 17 Rietfontein` for unresolved

- [ ] **Step 2: Write benchmark workflow tests**

Create `services/api/internal/cases/benchmark_workflow_test.go` with tests:

```go
func TestBenchmarkWorkflow_ClearCase(t *testing.T)
func TestBenchmarkWorkflow_ReviewCase(t *testing.T)
func TestBenchmarkWorkflow_StopCase(t *testing.T)
func TestBenchmarkWorkflow_UnresolvedCase(t *testing.T)
```

Each test should create a case, add at least one evidence item, record or close the outcome, and assert:

- final status
- decision outcome when present
- reason-code category rules
- audit event count is greater than or equal to three

- [ ] **Step 3: Add local verification instructions**

Append this section to `README.md`:

```md
## Phase 1 Case Workflow Verification

Run the internal decision-case workflow checks with:

```bash
sqlc generate
cd services/api && go test ./...
npm run test --workspace @titlechain/portal
```

The phase-one API expects `DATABASE_URL` for runtime database access. Unit tests use in-memory repositories for workflow validation.
```

- [ ] **Step 4: Run backend verification**

Run:

```bash
cd services/api && go test ./...
```

Expected: PASS.

- [ ] **Step 5: Commit fixtures**

Run:

```bash
git add services/api/internal/cases README.md
git commit -m "test: add phase one workflow benchmarks"
```

## Task 5: Add Portal API Client, Server Actions, And Internal Case Console Components

**Files:**

- Modify: `.env.example`
- Create: `apps/portal/app/internal/cases/types.ts`
- Create: `apps/portal/app/internal/cases/api.ts`
- Create: `apps/portal/app/internal/cases/actions.ts`
- Create: `apps/portal/app/internal/cases/_components/analyst-switcher.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-queue.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-intake-form.tsx`
- Create: `apps/portal/app/internal/cases/_components/case-detail.tsx`
- Create: `apps/portal/app/internal/cases/_components/decision-form.tsx`
- Create: `apps/portal/app/internal/cases/_components/evidence-form.tsx`
- Create: `apps/portal/app/internal/cases/case-console.test.tsx`

- [ ] **Step 1: Add portal API base URL**

Append to `.env.example`:

```env
TITLECHAIN_API_BASE_URL=http://localhost:8080
```

- [ ] **Step 2: Write failing component tests**

Create `apps/portal/app/internal/cases/case-console.test.tsx` with tests named:

```tsx
it("renders the shared review queue with ownership and status")
it("renders the intake form with required property fields")
it("renders the case detail decision form with reason codes")
it("renders the audit timeline")
```

Run:

```bash
npm run test --workspace @titlechain/portal -- app/internal/cases/case-console.test.tsx
```

Expected: FAIL because the components do not exist yet.

- [ ] **Step 3: Define portal types**

Create `apps/portal/app/internal/cases/types.ts` mirroring the Go API contract:

```ts
export type CaseStatus = "open" | "in_review" | "resolved" | "closed_unresolved" | "reopened";
export type DecisionOutcome = "clear" | "review" | "stop";
export type ReasonCategory = "clear_support" | "hard_block" | "review_trigger" | "unresolved_information";
export type EvidenceStatus = "captured" | "confirmed" | "conflicting" | "superseded";

export type Analyst = {
  id: string;
  display_name: string;
  email: string;
  active: boolean;
};

export type ReasonCode = {
  code: string;
  label: string;
  category: ReasonCategory;
  is_hard_block: boolean;
  sort_order: number;
};
```

Add the rest of the API response types: `CaseSummary`, `CaseDetail`, `PropertyMatch`, `EvidenceItem`, `Party`, `Decision`, and `AuditEvent`.

- [ ] **Step 4: Add server-side API client**

Create `apps/portal/app/internal/cases/api.ts`.

Required functions:

```ts
export async function listAnalysts(): Promise<Analyst[]>
export async function listReasonCodes(): Promise<ReasonCode[]>
export async function listCases(params?: { status?: CaseStatus; assignee_id?: string }): Promise<CaseSummary[]>
export async function getCase(caseId: string): Promise<CaseDetail>
export async function createCase(input: CreateCaseInput): Promise<CaseDetail>
export async function addEvidence(caseId: string, input: AddEvidenceInput): Promise<CaseDetail>
export async function recordDecision(caseId: string, input: RecordDecisionInput): Promise<CaseDetail>
export async function closeUnresolved(caseId: string, input: CloseUnresolvedInput): Promise<CaseDetail>
export async function reassignCase(caseId: string, input: ReassignCaseInput): Promise<CaseDetail>
```

`api.ts` should use:

```ts
const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";
```

Every fetch should use `cache: "no-store"` so the internal console does not show stale workflow data.

- [ ] **Step 5: Add server actions**

Create `apps/portal/app/internal/cases/actions.ts` with `"use server"`.

Required actions:

```ts
export async function createCaseAction(formData: FormData)
export async function addEvidenceAction(caseId: string, formData: FormData)
export async function recordDecisionAction(caseId: string, formData: FormData)
export async function closeUnresolvedAction(caseId: string, formData: FormData)
export async function reassignCaseAction(caseId: string, formData: FormData)
```

Each action should call the API client and then use `redirect` or `revalidatePath` from `next/navigation` / `next/cache`.

Use `actor_id` from the submitted form. The phase-one portal should render a seeded analyst selector rather than implementing auth.

- [ ] **Step 6: Add presentational components**

Create the components listed in this task. Keep them mostly presentational and accept typed props from `types.ts`.

Component responsibilities:

- `AnalystSwitcher`: renders seeded analysts as a select input named `actor_id`.
- `CaseQueue`: renders case reference, property description, status, assignee, and updated timestamp.
- `CaseIntakeForm`: renders required property fields plus optional title, matter reference, and note.
- `CaseDetail`: renders property summary, match state, evidence list, party list, decisions, and audit timeline.
- `DecisionForm`: renders decision selector, reason-code checkboxes grouped by category, and required note.
- `EvidenceForm`: renders structured evidence fields and status selector.

- [ ] **Step 7: Run component tests**

Run:

```bash
npm run test --workspace @titlechain/portal -- app/internal/cases/case-console.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit portal support code**

Run:

```bash
git add .env.example apps/portal/app/internal/cases
git commit -m "feat: add internal case console components"
```

## Task 6: Add Portal Routes For Intake, Queue, And Case Detail

**Files:**

- Create: `apps/portal/app/internal/cases/page.tsx`
- Create: `apps/portal/app/internal/cases/new/page.tsx`
- Create: `apps/portal/app/internal/cases/[caseId]/page.tsx`
- Modify: `apps/portal/app/globals.css`

- [ ] **Step 1: Run component tests before adding routes**

Run:

```bash
npm run test --workspace @titlechain/portal -- app/internal/cases/case-console.test.tsx
```

Expected: PASS from Task 5. Do not add React Testing Library tests that render async server route components directly; keep route content in tested presentational components and verify route integration with `next build`.

- [ ] **Step 2: Create queue route**

Create `apps/portal/app/internal/cases/page.tsx` as an async server component. It should:

- call `listCases()`
- call `listAnalysts()`
- render heading `Review queue`
- render a link to `/internal/cases/new`
- render `CaseQueue`

- [ ] **Step 3: Create intake route**

Create `apps/portal/app/internal/cases/new/page.tsx` as an async server component. It should:

- call `listAnalysts()`
- render heading `New decision case`
- render `CaseIntakeForm`

- [ ] **Step 4: Create case detail route**

Create `apps/portal/app/internal/cases/[caseId]/page.tsx` as an async server component. It should:

- call `getCase(params.caseId)`
- call `listAnalysts()`
- call `listReasonCodes()`
- render `CaseDetail`
- render `EvidenceForm`
- render `DecisionForm`

- [ ] **Step 5: Add minimal internal-console CSS**

Modify `apps/portal/app/globals.css` with a small internal console layer:

```css
@layer components {
  .internal-shell {
    min-height: 100vh;
    background: #f5f0e7;
    color: #18211d;
    padding: 32px;
  }

  .internal-panel {
    border: 1px solid rgba(24, 33, 29, 0.16);
    border-radius: 18px;
    background: rgba(255, 252, 245, 0.92);
    box-shadow: 0 18px 60px rgba(24, 33, 29, 0.08);
  }
}
```

Do not replace the landing-page styling in this task.

- [ ] **Step 6: Run portal verification**

Run:

```bash
npm run test --workspace @titlechain/portal
npm run build --workspace @titlechain/portal
```

Expected: PASS.

- [ ] **Step 7: Commit portal routes**

Run:

```bash
git add apps/portal/app/internal/cases apps/portal/app/globals.css
git commit -m "feat: add internal case console routes"
```

## Task 7: End-To-End Local Verification And Cleanup

**Files:**

- Review: `README.md`
- Review: `.env.example`

- [ ] **Step 1: Run database contract checks**

Run:

```bash
sqlc generate
goose -dir db/migrations postgres "$DATABASE_URL" status
```

Expected: `sqlc generate` passes. `goose status` passes when local Postgres is running.

- [ ] **Step 2: Run backend checks**

Run:

```bash
cd services/api && go test ./...
```

Expected: PASS.

- [ ] **Step 3: Run portal checks**

Run:

```bash
npm run test --workspace @titlechain/portal
npm run lint --workspace @titlechain/portal
npm run build --workspace @titlechain/portal
```

Expected: PASS.

- [ ] **Step 4: Run Rust checks to prove phase one did not break worker workspace**

Run:

```bash
cargo test --workspace
```

Expected: PASS.

- [ ] **Step 5: Run Docker Compose config validation**

Run:

```bash
docker compose -f infra/docker/docker-compose.yml config
```

Expected: PASS.

- [ ] **Step 6: Review git diff**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only phase-one files changed. No generated build artifacts, `.next`, or local environment files should be staged.

- [ ] **Step 7: Commit final cleanup when documentation changed**

If documentation or environment cleanup changed in this task, commit it:

```bash
git add README.md .env.example
git commit -m "docs: document phase one case workflow verification"
```

If there are no changes, do not create an empty commit.

## Review Checkpoints

Use subagent-driven implementation with one fresh worker per task.

After each task:

- inspect the diff before starting the next task
- run the task-specific verification command
- confirm that the task did not implement future-phase scope
- keep commits small and task-scoped

Critical review points:

- after Task 1, verify the database model matches the approved spec exactly
- after Task 2, verify decision validation cannot create false `clear` or unsupported `stop`
- after Task 3, verify handlers keep validation in the service rather than duplicating business rules in HTTP
- after Task 6, verify the portal is an internal analyst console, not a customer-facing pilot product

## Completion Criteria

Phase 1 is complete when:

- an internal case can be created from manual property details
- the case auto-assigns to the creating analyst
- seeded property match candidates are stored and visible
- structured evidence can be added immutably
- optional parties can be added
- assignment changes are audited
- decisions require fixed reason codes and required notes
- `stop` requires hard-block reason codes
- unresolved closure requires unresolved-information reason codes
- case detail exposes evidence, decisions, and audit timeline
- all verification commands in Task 7 pass
