-- name: GetPilotUserByEmail :one
SELECT u.id, u.organization_id, u.email, u.display_name, u.role, u.password_hash, u.active, u.created_at,
       o.name AS organization_name, o.slug AS organization_slug, o.status AS organization_status
FROM pilot.users u
JOIN pilot.organizations o ON o.id = u.organization_id
WHERE lower(u.email) = lower($1);

-- name: GetPilotUserBySessionTokenHash :one
SELECT u.id, u.organization_id, u.email, u.display_name, u.role, u.password_hash, u.active, u.created_at,
       o.name AS organization_name, o.slug AS organization_slug, o.status AS organization_status
FROM pilot.sessions s
JOIN pilot.users u ON u.id = s.user_id
JOIN pilot.organizations o ON o.id = u.organization_id
WHERE s.token_hash = $1
  AND s.revoked_at IS NULL
  AND s.expires_at > NOW();

-- name: CreatePilotSession :one
INSERT INTO pilot.sessions (user_id, token_hash, expires_at)
VALUES ($1, $2, $3)
RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at;

-- name: RevokePilotSession :exec
UPDATE pilot.sessions
SET revoked_at = NOW()
WHERE token_hash = $1 AND revoked_at IS NULL;

-- name: CreatePilotMatterLink :one
INSERT INTO pilot.matter_links (
    organization_id, created_by_user_id, case_id, customer_reference, customer_status
) VALUES ($1, $2, $3, $4, 'submitted')
RETURNING id, organization_id, created_by_user_id, case_id, customer_reference, customer_status,
          submitted_at, last_customer_viewed_at, created_at, updated_at;

-- name: ListPilotMatterSummaries :many
SELECT ml.id AS matter_id,
       ml.case_id,
       ml.customer_reference,
       ml.customer_status,
       ml.submitted_at,
       ml.updated_at,
       c.case_reference,
       c.property_description,
       c.locality_or_area,
       c.municipality_or_deeds_office,
       c.title_reference,
       c.status AS internal_status,
       d.decision AS current_decision
FROM pilot.matter_links ml
JOIN ops.case_records c ON c.id = ml.case_id
LEFT JOIN ops.case_decisions d ON d.case_id = c.id AND d.status = 'current'
WHERE ml.organization_id = $1
  AND (sqlc.narg('customer_status')::text IS NULL OR ml.customer_status = sqlc.narg('customer_status')::text)
ORDER BY ml.submitted_at DESC
LIMIT $2;

-- name: GetPilotMatterLinkForOrg :one
SELECT ml.id, ml.organization_id, ml.created_by_user_id, ml.case_id, ml.customer_reference,
       ml.customer_status, ml.submitted_at, ml.last_customer_viewed_at, ml.created_at, ml.updated_at
FROM pilot.matter_links ml
WHERE ml.id = $1 AND ml.organization_id = $2;

-- name: TouchPilotMatterViewed :exec
UPDATE pilot.matter_links
SET last_customer_viewed_at = NOW(), updated_at = NOW()
WHERE id = $1 AND organization_id = $2;

-- name: UpdatePilotMatterStatusByCase :exec
UPDATE pilot.matter_links
SET customer_status = $2, updated_at = NOW()
WHERE case_id = $1;

-- name: CreatePilotSummaryExport :one
INSERT INTO pilot.summary_exports (matter_link_id, requested_by_user_id, format)
VALUES ($1, $2, 'html_print')
RETURNING id, matter_link_id, requested_by_user_id, format, created_at;

-- name: GetPilotCaseContext :one
SELECT ml.id AS matter_id,
       ml.organization_id,
       o.name AS organization_name,
       ml.customer_reference,
       ml.customer_status,
       ml.submitted_at
FROM pilot.matter_links ml
JOIN pilot.organizations o ON o.id = ml.organization_id
WHERE ml.case_id = $1;

-- name: GetPilotMetrics :one
SELECT
    COUNT(*)::int AS submitted_count,
    COUNT(CASE WHEN ml.customer_status = 'resolved' THEN 1 END)::int AS resolved_count,
    COUNT(CASE WHEN ml.customer_status = 'reopened' THEN 1 END)::int AS reopened_count,
    COUNT(CASE WHEN ml.customer_status = 'in_review' THEN 1 END)::int AS in_review_count,
    COUNT(CASE WHEN c.status = 'closed_unresolved' THEN 1 END)::int AS unresolved_count,
    COALESCE(EXTRACT(EPOCH FROM AVG(c.resolved_at - ml.submitted_at))::int, 0)::int AS avg_seconds_to_resolve,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(CASE WHEN ml.customer_status = 'in_review' THEN ml.submitted_at END)))::int, 0)::int AS oldest_in_review_seconds,
    COUNT(CASE WHEN d.decision_source = 'accepted_proposal' THEN 1 END)::int AS accepted_proposal_count,
    COUNT(CASE WHEN d.decision_source = 'manual_override' THEN 1 END)::int AS manual_override_count
FROM pilot.matter_links ml
JOIN ops.case_records c ON c.id = ml.case_id
LEFT JOIN ops.case_decisions d ON d.case_id = c.id AND d.status = 'current';
