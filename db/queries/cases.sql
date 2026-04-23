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
