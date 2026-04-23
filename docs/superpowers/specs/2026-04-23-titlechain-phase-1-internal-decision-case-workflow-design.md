# TitleChain Phase 1 Internal Decision Case Workflow Design

Date: 2026-04-23
Topic: Internal analyst-led clear-to-lodge case workflow
Status: Approved design draft written for user review

## Project Context

TitleChain is being built as the verification layer for South African property transfers. The broader company goal is to help conveyancers, originators, and lenders determine whether a matter is clear to lodge, needs review, or should be stopped before lodgement or payout.

The repository already contains the platform foundation:

- `apps/portal` for the internal portal surface
- `services/api` for the Go HTTP service and control plane
- `workers/deeds-pipeline` and Rust crates for future ingestion and normalization
- `db` for migrations and SQL query definitions
- `infra` for local Docker Compose and observability bootstrap

What does not yet exist is the first usable product slice: a durable internal workflow for creating a matter, capturing evidence, making a defensible decision, and preserving the audit trail.

This spec defines that first usable slice.

## Scope

Phase 1 covers:

- internal-only analyst console workflow
- case creation from manual property entry
- seeded property match suggestions
- structured evidence capture
- optional party enrichment
- explicit case assignment and reassignment
- decision recording using `clear`, `review`, or `stop`
- unresolved closure path for insufficient evidence
- immutable audit history
- fixed system reason-code catalog
- portal and API behavior required to process one matter at a time
- seeded fixtures and tests for the first benchmark cases

Phase 1 does not cover:

- live external source integration as a hard requirement
- file uploads or binary attachment storage
- batch processing
- public or partner APIs
- customer-facing pilot access
- customer-configurable rules or reason codes
- second-review approval requirements
- advanced fraud scoring
- multi-tenant controls

## Goal

Build an internal analyst-led decision case system that lets TitleChain process one property matter at a time and produce a structured, auditable `clear`, `review`, or `stop` outcome, with unresolved closure allowed when the evidence is insufficient.

The purpose of phase 1 is not to automate property verification fully. It is to define and prove the case model, evidence model, decision model, and workflow semantics that later ingestion and automation phases will depend on.

## Product Decision

Phase 1 should use an analyst-led internal console rather than a mostly automated system.

Rationale:

- it keeps the first phase honest about uncertainty
- it produces cleaner benchmark data for later automation
- it allows the team to refine the evidence model before binding it to real-source ingestion
- it avoids false confidence created by weak early automation

## Architecture Overview

Phase 1 should stay inside the existing modular-monolith repo structure.

- `apps/portal`
  Internal analyst-facing UI for queue management, case detail, decision capture, and audit review.
- `services/api`
  Single source of truth for case workflow rules, validation, persistence orchestration, and portal APIs.
- `db`
  Durable system of record for cases, evidence, assignments, decisions, reason codes, and audit events.
- `workers/*`
  Not on the critical path for phase 1 except for optional seeded-data loading or future migration helpers.

This phase should be API-driven, not worker-driven. The worker and ingestion path remain phase-two concerns.

## Actor Identity Model

Phase 1 should use a lightweight internal analyst identity model rather than full authentication.

Recommended approach:

- seed a small internal analyst roster into the system
- require every API write action to carry an acting analyst id
- let the internal portal select the acting analyst from the seeded roster during phase 1
- store that acting analyst id on assignments, decisions, evidence items, and audit events

This is deliberate. Phase 1 needs durable actor identity for ownership and auditability, but it does not need full customer-facing auth or session management yet.

## Core Workflow

The phase-one workflow should be:

1. An analyst creates a case by entering property details manually.
2. The system generates seeded property match suggestions.
3. The case auto-assigns to the creating analyst.
4. The analyst confirms a seeded property match or leaves the property linkage unresolved.
5. The analyst adds structured evidence items and optional party details.
6. The analyst selects one or more fixed reason codes and writes a required decision note.
7. The analyst records `clear`, `review`, or `stop`, or closes the case as unresolved.
8. Any later change reopens the case and preserves prior decision history.

This workflow intentionally optimizes for defensibility over throughput.

## Product Shape

The primary unit in phase 1 should be a `decision case`.

Each case represents one property-linked matter under review and owns:

- intake details
- property linkage state
- assignment
- evidence items
- optional parties
- current decision
- prior decisions
- audit history

This case-centric model is preferred over a property-registry-first design or a generic ops-ticket system because the real customer outcome is one matter and one decision, not generic task handling or database browsing.

## Decision And Status Model

### Customer-Facing Decision Outcomes

The system should produce three decision outcomes:

- `clear`
  No material blocker found in the available evidence.
- `review`
  Ambiguity, anomaly, missing evidence, or serious non-conclusive risk exists.
- `stop`
  A hard blocker or explicitly defined no-go condition exists.

### Internal Case Resolution States

The system should also allow unresolved case closure without treating it as a fourth decision outcome.

Recommended case status set:

- `open`
- `in_review`
- `resolved`
- `closed_unresolved`
- `reopened`

Status meanings:

- `open`
  Case has been created but not yet meaningfully worked.
- `in_review`
  Analyst is actively evaluating evidence and the case is not yet resolved.
- `resolved`
  A `clear`, `review`, or `stop` decision has been recorded.
- `closed_unresolved`
  Analyst closed the case without a defensible decision because evidence was insufficient.
- `reopened`
  A previously resolved or unresolved case has been reactivated and now requires a new review cycle.

Recommended operating rules:

- `review` is the default safe path when confidence is insufficient
- `stop` requires at least one hard-block reason code
- `clear` requires at least one clear-support reason code and no hard-block reason codes
- `closed_unresolved` requires an explicit note describing what remains missing or ambiguous

This preserves clean customer-facing decision semantics while keeping internal workflow truthful.

## Assignment Model

Phase 1 should use explicit assignment and ownership from the start.

Assignment rules:

- a case auto-assigns to the creating analyst
- analysts can reassign a case manually
- reassignment must be audited
- ownership should be visible in queue and case detail views

Queue rules:

- the portal should expose a shared review queue
- analysts should also be able to filter by ownership and status
- recommended filters:
  - `my cases`
  - `in review`
  - `resolved`
  - `reopened`
  - `unresolved`

This gives operational clarity without needing full workforce management features.

## Evidence Model

Phase 1 should support structured evidence plus notes only. It should not support file uploads or stored binary attachments.

Each evidence item should contain:

- evidence type
- source type
- source reference
- optional external reference
- excerpt or short source summary
- extracted facts
- evidence status
- analyst note
- created-by actor and timestamp

Recommended evidence statuses:

- `captured`
- `confirmed`
- `conflicting`
- `superseded`

Evidence items should be immutable after creation in phase 1.

If an analyst needs to correct or replace evidence, they should add a new evidence item and preserve the earlier record in history.

The evidence model should be structured enough to support:

- queryable audit history
- repeatable benchmark fixtures
- future rule automation
- future attachment support through reference fields rather than schema replacement

If an analyst needs to cite a document or screenshot in phase 1, they should store a reference and note, not an uploaded file.

## Party Model

Party details should be optional enrichers rather than required intake fields.

Why:

- the product promise is property-first verification
- party data is often incomplete or ambiguous at the start
- requiring party details too early would block real workflows

When present, party records should still be structured and role-based, for example:

- seller
- buyer
- conveyancer reference
- company or legal entity if relevant

## Property Intake And Match Model

Phase 1 should begin with manual property entry.

The required intake fields should be:

- free-text property description
- locality, suburb, or area
- municipality or deeds-office context

The optional intake fields should be:

- title reference if known
- internal matter reference
- free-text intake note

The system should then produce seeded property match suggestions and allow the analyst to:

- confirm a suggested property
- reject all suggestions and keep the case unresolved
- continue the case while property linkage remains unresolved

This is intentionally better than a select-from-database-first workflow because it mirrors the real-world start of a matter while still allowing internal seeded data to support case creation.

## Reason Code Model

Phase 1 should use a fixed system reason-code catalog shipped in the app.

Reason codes should be:

- seeded into the database so they are queryable
- grouped by category
- marked when they represent hard blockers versus review signals
- not editable through the UI in phase 1

Every recorded decision must include:

- at least one reason code
- a required analyst note

Decision validation should be:

- `clear` may use only clear-support reason codes
- `review` may use review-trigger reason codes and unresolved-information reason codes
- `stop` must include at least one hard-block reason code and may also include review-trigger codes
- unresolved closure should require at least one unresolved-information reason code plus a required note

The reason-code system is critical because it creates structured decision data for later automation and reporting. Free-form notes alone would make phase-three rule automation materially weaker.

## Recommended Reason Code Categories

The first catalog should separate:

- hard blocker reasons
- review-trigger reasons
- clear-support reasons
- unresolved-information reasons

Examples of category intent:

- hard blocker: a title defect or explicit no-go condition
- review-trigger: anomaly, conflict, or ambiguity needing human follow-up
- clear-support: evidence that supports clean progression
- unresolved-information: required information missing or unverifiable

The catalog should be small and opinionated in phase 1. It should not try to enumerate every future nuance.

## Data Model

Phase 1 should introduce new workflow tables under the `ops` schema.

Recommended tables:

- `ops.case_records`
  Top-level case object containing intake details, linked property identity, status, assignee, timestamps, and summary fields.
- `ops.case_property_matches`
  Candidate and confirmed property matches, including confidence and match source.
- `ops.case_parties`
  Optional role-based parties attached to a case.
- `ops.case_evidence_items`
  Structured evidence records and analyst-authored evidence notes.
- `ops.case_decisions`
  Current and historical decision records, with historical rows preserved and only one non-superseded current row per case.
- `ops.case_decision_reason_codes`
  Join table linking decision records to reason codes.
- `ops.reason_codes`
  Seeded fixed catalog of allowed reason codes.
- `ops.case_audit_events`
  Immutable event history for case lifecycle changes.

Data model rules:

- decisions are append-only historically
- audit events are immutable
- the current displayed decision should be derived from the latest non-superseded decision record rather than destructive updates
- all major workflow actions should preserve actor and timestamp

## API Surface

Phase 1 should expose a narrow internal API surface, all under internal routes.

Required endpoints:

- create case
- list cases by queue, status, and assignee
- fetch case detail
- add evidence item
- add or update party detail
- update assignment
- record decision
- close unresolved
- reopen case
- list reason codes
- list property match suggestions for intake

The API should validate workflow rules centrally so the portal remains a thin client.

## Portal Surface

Phase 1 portal work should focus on three screens:

### 1. Case Intake

- manual property entry form
- seeded property suggestions
- create-and-open behavior

### 2. Review Queue

- shared queue view
- filters by assignee and status
- visible ownership
- clear navigation into case detail

### 3. Case Detail

- property summary and linkage state
- optional party section
- structured evidence list
- assignment controls
- decision form with reason-code selection and required note
- unresolved closure action
- audit timeline

The portal should optimize for clarity and traceability, not customer-facing polish.

## Validation Rules

The following validations should be enforced in the API:

- case creation requires `property_description`, `locality_or_area`, and `municipality_or_deeds_office`
- decisions require at least one reason code
- decisions require a non-empty note
- `stop` requires at least one hard-block reason code
- `clear` rejects hard-block and unresolved-information reason codes
- `review` rejects hard-block reason codes
- unresolved closure requires at least one unresolved-information reason code and a non-empty note
- reassignment requires a valid assignee value
- evidence items require structured type and source metadata

The API should reject invalid combinations rather than silently storing partial workflow state.

## Audit Requirements

Every meaningful mutation must create an immutable audit event.

Required audit event types include:

- case created
- property match confirmed
- property match rejected
- assignee changed
- evidence item added
- party added or updated
- decision recorded
- case closed unresolved
- case reopened

Audit records must include:

- actor
- timestamp
- event type
- case id
- structured event metadata

The audit trail is not optional metadata. It is part of the product contract.

## Testing Strategy

Phase 1 should be tested against the decision-case contract, not against live-source integrations.

Required test coverage:

- API handler tests for case creation, assignment, evidence submission, decision submission, unresolved closure, and reopen flow
- store tests for persistence correctness and historical decision behavior
- portal tests for intake flow, queue rendering, case detail rendering, and decision form behavior
- fixture-driven tests for at least four benchmark scenarios:
  - clean case
  - ambiguous review case
  - hard blocker stop case
  - unresolved information case

The benchmark fixtures should be stable enough to support future decision-engine comparisons in phase 3.

## Error Handling And Uncertainty

Phase 1 should treat uncertainty explicitly.

Product rules:

- missing or ambiguous evidence should push the analyst toward `review` or unresolved closure, not false `clear`
- property linkage can remain unresolved while the case still exists
- evidence insufficiency is a valid internal outcome and should be measurable

This is important because phase 1 is supposed to teach the system what certainty looks like, not hide uncertainty inside notes.

## Non-Goals

Phase 1 must not drift into:

- live-source ingestion implementation
- external customer login
- public or private partner APIs
- batch check orchestration
- binary attachments
- configurable reason-code administration
- second-review approval rules
- generalized workflow engine adoption
- fraud-model sophistication beyond structured reason capture

These are all valid later concerns, but they are not required to prove the first usable product slice.

## Success Criteria

Phase 1 is successful when:

- an internal analyst can create and process a case end to end
- the system stores structured evidence and structured decisions
- every decision is backed by reason codes and a required note
- every major workflow action is auditable
- unresolved outcomes are handled honestly rather than forced into false decisions
- seeded fixtures can be used to demo and test `clear`, `review`, `stop`, and unresolved workflows

## Recommended Follow-On

Once phase 1 is implemented and validated internally, the next step should be phase 2: ingesting and normalizing the minimum viable source set needed to populate cases from real data rather than seeded fixtures.
