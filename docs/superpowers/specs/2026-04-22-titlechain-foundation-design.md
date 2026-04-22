# TitleChain Foundation Design

Date: 2026-04-22
Topic: Platform foundation for TitleChain's data pipeline, API, portal, and CI bootstrap
Status: Approved design draft written for user review

## Project Context

TitleChain is a South African property transaction intelligence platform aimed at conveyancing attorneys, banks, and insurers. The existing repository currently contains an early Next.js marketing implementation and no backend platform foundation yet. This spec defines the first backend-focused sub-project: the monorepo, service boundaries, database layering, local infrastructure, and CI needed to support future ingestion, normalization, and lookup work.

This spec intentionally excludes full ingestion business logic, fraud scoring sophistication, and public API rollout. Those belong in follow-on specs after the platform foundation exists.

## Scope

This first foundation spec covers:

- monorepo structure
- Go API bootstrap
- Rust workspace bootstrap
- PostgreSQL schema and migration conventions
- Redis role and limits
- local Docker Compose infrastructure
- Prometheus-ready observability hooks
- CI workflows for linting, tests, builds, migrations, and schema/query discipline
- internal-only auth and route structure
- DB-mediated worker orchestration contracts

This first foundation spec does not cover:

- full deeds ingestion implementation
- public partner API rollout
- multi-tenant customer architecture
- advanced RBAC
- workflow engine adoption
- production fraud models
- source-by-source parsing rules

## Product And Delivery Decisions

The following architectural decisions were validated during brainstorming:

- Deployment target: single VM first
- Repository shape: disciplined monorepo
- Service topology: one Go API service plus one Rust workspace and one worker binary
- External contract strategy: internal/private API first, but structured so a future partner API can emerge cleanly
- Primary success criterion: data pipeline readiness
- Job orchestration strategy: Postgres-first job state, Redis only as support infrastructure
- Migration strategy: `goose` plus `sqlc`
- Historical data strategy: hybrid versioned model, not plain CRUD and not full event sourcing
- Auth posture: internal-only and single-tenant in phase one
- Rust topology: internal crates plus a single worker binary first

## Goal

Create a production-shaped platform foundation that optimizes for replayable ingestion, durable provenance, and clean service boundaries without paying premature microservice or multi-tenant complexity costs.

The output of this foundation should be a repo that can immediately support the next phase: implementing ingestion and normalization flows against real source data.

## Architecture Overview

TitleChain should begin as a balanced modular monolith inside a monorepo.

The Go service owns the external interface and control plane. It exposes internal HTTP routes, health and metrics endpoints, operational job controls, and read-side lookup endpoints for the portal. The Rust worker owns the data-quality path: parsing, normalization, entity resolution, deduplication, and publication into canonical tables. Postgres is the system of record for workflow state, provenance, historical data, and read models. Redis is present only for auxiliary concerns such as cache and light coordination.

The architecture is intentionally biased toward auditability and replayability over raw throughput. That is the right trade for TitleChain because the moat lives in clean, historically defensible property intelligence rather than in generic web-service fan-out.

## Monorepo Structure

Recommended top-level layout:

- `apps/portal`
  Internal Next.js portal. This remains internal-facing in phase one and should not assume public self-serve onboarding.
- `services/api`
  Go Chi-based HTTP service.
- `workers/deeds-pipeline`
  Rust worker binary for data-processing execution.
- `crates/pipeline-core`
  Shared Rust pipeline types, contracts, and common errors.
- `crates/deeds-normalizer`
  Source-specific parsing and normalization logic.
- `crates/entity-resolution`
  Deduplication, matching, and canonicalization logic.
- `crates/storage`
  Rust persistence adapters for Postgres-backed pipeline state.
- `db/migrations`
  SQL migrations managed by `goose`.
- `db/queries`
  SQL files used by `sqlc` to generate Go query code.
- `schemas/openapi`
  Internal API contract files and future public-surface starting point.
- `infra/docker`
  Compose files and image-oriented deployment assets.
- `infra/monitoring`
  Prometheus configuration and scrape wiring.
- `infra/load`
  `k6` smoke and load scenarios.
- `docs/superpowers/specs`
  Design specs.
- `docs/superpowers/plans`
  Implementation plans.

## Ownership Boundaries

The repo should enforce these responsibilities:

- Go owns HTTP interfaces, auth/session handling, operational controls, metrics/health endpoints, and read-side orchestration.
- Rust owns messy-source parsing, normalization, matching, deduplication, and canonical publication logic.
- Postgres owns durable workflow state, historical lineage, provenance, and current read models.
- Redis is never the source of truth.
- Shared business rules should not be duplicated in both Go and Rust. If a rule is fundamentally about messy source interpretation, Rust is the canonical implementation.

## Runtime Architecture

Initial runtime components:

- `portal`
  Next.js internal UI for operational visibility and lookup access.
- `api`
  Go service exposing internal routes and control plane behavior.
- `worker`
  Rust background process claiming and executing units of work.
- `postgres`
  primary durable data store.
- `redis`
  auxiliary cache and light coordination service.
- `prometheus`
  metrics scraping and local observability bootstrap.

The initial deployment target is Docker Compose for both local development and single-VM deployment. Later deployment assets may add environment-specific overrides, but Kubernetes concerns should not shape the first design.

## Data Flow

The runtime data flow should work like this:

1. A source batch or dataset is registered in Postgres with manifest metadata.
2. Raw source payloads or file references are recorded in immutable `raw_*` tables.
3. The Rust worker claims a runnable unit of work using durable lease and attempt semantics.
4. Parsing and normalization logic writes structured intermediate records into `stage_*` tables.
5. Entity resolution and deduplication create or update canonical `core_*` versions.
6. Read-facing `read_*` tables are refreshed from canonical state.
7. The Go API serves internal lookup and operational endpoints from `read_*`, with drill-down into provenance and workflow history from `core_*` and `ops_*`.

This flow is DB-mediated rather than queue-first. That is deliberate. The system needs durable audit trails, replay controls, and debuggable job lifecycle history more than it needs early high-throughput asynchronous fan-out.

## Job Lifecycle And Orchestration

The first foundation should use Postgres-backed workflow state rather than introducing a queue-centric or workflow-engine-centric architecture.

Operational model:

- The Go API creates run records, manifests, and control actions.
- The Rust worker claims executable units of work by transitioning DB-backed state.
- Each job attempt is recorded with timestamps, failure details, lease ownership, and retry count.
- Failed or poisoned work is quarantined explicitly rather than retried indefinitely.
- Checkpoints are stored durably so long-running work can resume without recomputing safe prior stages unnecessarily.

Idempotency is a hard requirement. Re-running a batch must not silently duplicate canonical outputs or corrupt history.

## Database Architecture

TitleChain should use a layered Postgres model with hybrid historical semantics.

### Raw Layer

`raw_*` tables store immutable landed records and source metadata. They should retain:

- source identifiers
- batch identifiers
- import timestamps
- content hashes
- row hashes where applicable
- original payload fragments or file references
- provenance anchors back to the batch manifest

These tables are append-only in normal operation.

### Staging Layer

`stage_*` tables store parsed and normalized intermediate records derived from `raw_*`. These tables are rebuildable from the raw layer. They exist to isolate source cleanup from canonical domain semantics.

### Core Layer

`core_*` tables store canonical, historically versioned business entities. Examples include:

- properties
- title states
- encumbrances or bonds
- ownership relationships
- disputes and anomaly markers
- linked party references where supported

The core layer should use stable canonical identifiers plus version rows with fields such as:

- `valid_from`
- `valid_to`
- `superseded_by`
- provenance references back to pipeline runs and source evidence

Corrections create new versions. They do not rewrite history away.

### Read Layer

`read_*` tables are denormalized serving models for portal and API use. They are not the source of truth and should be rebuildable from canonical state.

### Ops Layer

`ops_*` tables store:

- ingestion manifests
- run metadata
- work claims
- attempt history
- checkpoints
- quarantine records
- privileged action audit events

## Database Conventions

The following conventions should be adopted from the start:

- `goose` manages migrations
- `sqlc` generates Go query code from SQL files
- SQL remains the source of truth for schema and query contracts
- UUID primary keys are preferred for opaque external identifiers
- natural-key uniqueness constraints should be added where stable and defensible
- `created_at` and `updated_at` fields should exist where mutation semantics require them
- JSONB is acceptable for raw payload preservation and narrowly justified flexible metadata, but it should not become a substitute for core modeling
- soft delete should be used sparingly; most history should be represented through immutability or versioning instead

## Migration Strategy

`goose` is the recommended migration tool for this phase.

Rationale:

- It fits a SQL-first Postgres workflow cleanly.
- It complements `sqlc` naturally.
- It supports SQL migrations as the default path while still allowing exceptional Go-based migrations if a backfill or data movement task becomes awkward in raw SQL.
- It does not impose a heavier declarative schema-management model earlier than necessary.

Most migrations should remain pure SQL. Go migrations should be rare and justified.

## Go API Architecture

The initial Go service should be organized with clear internal packages instead of being split into multiple deployables.

Suggested structure under `services/api`:

- `cmd/api`
  bootstrap and process startup
- `internal/http`
  router setup, handlers, middleware, transport models
- `internal/auth`
  internal-only auth/session concerns
- `internal/platform`
  configuration, logging, metrics, health, tracing hooks, and utility abstractions
- `internal/jobs`
  orchestration of run creation, retry, pause, resume, and quarantine controls
- `internal/property`
  read-side use cases for property lookup and provenance drill-down
- `internal/audit`
  privileged action logging
- `internal/store`
  `sqlc` integration and thin repository wrappers where needed

## API Route Strategy

Even though the first surface is internal-only, the route tree should be shaped so a later partner API can emerge without churn.

Phase-one routes should include:

- `/healthz`
- `/readyz`
- `/metrics`
- `/api/internal/portal/*`
- `/api/internal/ops/*`

A future placeholder namespace should be reserved but not implemented yet:

- `/api/partner/v1/*`

The internal API should still use version-conscious response and error design from the start.

## Auth And Security Posture

Phase one should stay single-tenant and internal-only.

This means:

- one internal operator identity model
- minimal portal/session auth or equivalent admin access control
- privileged action audit logging from day one
- request context structured so future `org_id`, `scope`, and partner identity data can be introduced later without restructuring every handler

This phase should explicitly avoid:

- customer tenancy
- public API key management
- self-serve user administration
- complex RBAC matrices

## Rust Worker Architecture

The Rust side should start as internal crates plus a single worker binary.

Suggested structure:

- `workers/deeds-pipeline`
  worker process bootstrap, configuration, loop, metrics, and top-level orchestration
- `crates/pipeline-core`
  shared pipeline types and error taxonomy
- `crates/deeds-normalizer`
  source parsing and cleanup rules
- `crates/entity-resolution`
  matching, scoring, canonicalization, and deduplication rules
- `crates/storage`
  Postgres-facing persistence and checkpoint adapters

This layout keeps the data-quality path modular without paying the cost of multiple deployables before real scaling boundaries are known.

## Observability

Prometheus should be part of the initial stack. The first foundation should expose enough metrics to understand service health and pipeline state.

At minimum:

- API request counts, latency, and error rates
- worker claim/execution/failure counters
- run durations and retry counts
- queueable-work visibility derived from Postgres state
- basic process and runtime health indicators

The initial goal is not full observability maturity. The goal is to avoid flying blind during ingestion development.

## Local Infrastructure

The first foundation should ship a Docker Compose-based local stack containing:

- portal
- api
- worker
- postgres
- redis
- prometheus

Service startup should remain explicit and simple. The stack should optimize for reproducible local development and straightforward single-VM deployment.

## CI Strategy

GitHub Actions should validate the full monorepo foundation.

Recommended workflow responsibilities:

- frontend lint, test, and build
- Go format/lint/test/build
- Rust format/clippy/test/build
- `goose validate`
- `sqlc generate` or equivalent drift enforcement
- migration smoke test against ephemeral Postgres
- API and worker image build sanity checks

Suggested workflow grouping:

- `quality.yml`
- `migrations.yml`
- `docker.yml`

A lightweight `k6` smoke scenario is useful once a minimal lookup path exists, but it is not required before the foundation repo exists.

## Developer Ergonomics

The first foundation should include a small but disciplined bootstrap surface:

- a root `Makefile` or equivalent task runner
- `.env.example`
- clear local bootstrap commands
- deterministic local service wiring
- minimal seed data only if it is stable and necessary

Developer convenience should remain a secondary optimization. The primary optimization is a platform shape that supports replayable, trustworthy data processing.

## Non-Goals

This foundation does not attempt to solve:

- all source connectors
- production fraud scoring depth
- public API commercialization concerns
- customer tenancy
- workflow engines such as Temporal
- additional microservices beyond the initial Go API and Rust worker binary

## Risks

Key risks in this phase:

- schema churn across raw, stage, core, and read layers
- duplicated domain logic across Go and Rust
- non-idempotent or non-replayable jobs
- read models becoming accidental sources of truth
- premature auth and service complexity
- weak provenance that undermines trust in downstream outputs

## Mitigations

The design addresses these risks by:

- assigning normalization and entity-resolution authority to Rust
- keeping workflow state and provenance in Postgres
- treating read models as rebuildable and disposable
- enforcing migration and query discipline in CI
- keeping service count low while preserving internal package boundaries
- delaying tenancy and public API complexity until the data platform is stable

## Success Criteria

The foundation is successful when:

- a stable monorepo structure exists with the agreed top-level boundaries
- the local stack boots via Docker Compose
- Go API, Rust worker, Postgres, Redis, and portal integrate cleanly
- `goose` migrations run cleanly
- `sqlc` generation is wired and checked
- worker lifecycle state exists in the DB with claim, retry, checkpoint, and quarantine semantics
- Prometheus can scrape the API and worker
- CI verifies formatting, linting, tests, builds, and migration discipline across the stack
- the repository is ready for the next spec focused on ingestion and normalization implementation

## Follow-On Specs

After this foundation is implemented, the next likely specs should be:

1. Deeds ingestion and raw landing design
2. Normalization and entity-resolution design
3. Internal lookup API and portal workflow design
4. Fraud signal enrichment and anomaly modeling design
