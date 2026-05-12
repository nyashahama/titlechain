-- name: GetAnalyticsOperatingSummary :one
WITH scoped_matters AS (
    SELECT c.id AS case_id, ml.submitted_at, ml.customer_status, c.status, c.resolved_at
    FROM pilot.matter_links ml
    JOIN ops.case_records c ON c.id = ml.case_id
    WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR ml.submitted_at >= sqlc.narg('from_at')::timestamptz)
      AND ml.submitted_at < sqlc.arg('to_at')::timestamptz
),
current_decisions AS (
    SELECT d.decision_source
    FROM ops.case_decisions d
    JOIN scoped_matters sm ON sm.case_id = d.case_id
    WHERE d.status = 'current'
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
GROUP BY rc.code, rc.label, rc.category, rc.sort_order
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
        AND e.created_at < sqlc.arg('to_at')::timestamptz
    GROUP BY sc.id
),
exception_decisions AS (
    SELECT DISTINCT d.case_id
    FROM ops.case_decisions d
    WHERE d.status = 'current'
      AND d.evidence_exception = TRUE
      AND (sqlc.narg('from_at')::timestamptz IS NULL OR d.created_at >= sqlc.narg('from_at')::timestamptz)
      AND d.created_at < sqlc.arg('to_at')::timestamptz
)
SELECT
    COALESCE((
        SELECT COUNT(*)
        FROM ops.case_evidence_items e
        WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR e.created_at >= sqlc.narg('from_at')::timestamptz)
          AND e.created_at < sqlc.arg('to_at')::timestamptz
    ), 0)::int AS total_items,
    COUNT(*) FILTER (WHERE evidence_count = 0)::int AS cases_without_evidence,
    COUNT(*) FILTER (WHERE confirmed_count = 0)::int AS cases_without_confirmed_evidence,
    (SELECT COUNT(*) FROM exception_decisions)::int AS exception_approved_count
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
),
latest_error AS (
    SELECT j.error_message
    FROM ops.jobs j
    JOIN latest_run lr ON lr.id = j.run_id
    WHERE j.error_message IS NOT NULL AND j.error_message <> ''
    ORDER BY j.updated_at DESC
    LIMIT 1
)
SELECT
    COALESCE(lr.id::text, '')::text AS latest_run_id,
    COALESCE(lr.status, 'none')::text AS latest_run_status,
    COALESCE(le.error_message, '')::text AS latest_error,
    COALESCE((
        SELECT COUNT(*)
        FROM ops.jobs j
        JOIN latest_run latest ON latest.id = j.run_id
        WHERE j.status = 'failed'
    ), 0)::int AS failed_job_count,
    COALESCE((
        SELECT COUNT(*)
        FROM ops.jobs j
        JOIN latest_run latest ON latest.id = j.run_id
        WHERE j.status IN ('pending', 'leased', 'running')
    ), 0)::int AS pending_job_count,
    (SELECT COUNT(*) FROM stage.quarantined_records)::int AS quarantined_record_count,
    (SELECT COUNT(*) FROM core.source_links)::int AS source_link_count,
    ls.finished_at AS last_successful_run_at
FROM (SELECT 1) anchor
LEFT JOIN latest_run lr ON TRUE
LEFT JOIN latest_success ls ON TRUE
LEFT JOIN latest_error le ON TRUE;

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
        CASE WHEN d.evidence_exception = TRUE THEN 'evidence_exception_approved' END,
        CASE WHEN COUNT(e.id) FILTER (WHERE e.evidence_status = 'confirmed') = 0 THEN 'no_confirmed_evidence' END,
        CASE WHEN COUNT(e.id) FILTER (WHERE e.evidence_status = 'conflicting') > 0 THEN 'conflicting_evidence' END
    ], NULL)::text[] AS risk_reasons
FROM ops.case_records c
LEFT JOIN pilot.matter_links ml ON ml.case_id = c.id
LEFT JOIN pilot.organizations o ON o.id = ml.organization_id
LEFT JOIN ops.case_decisions d ON d.case_id = c.id AND d.status = 'current'
    AND d.created_at < sqlc.arg('to_at')::timestamptz
LEFT JOIN ops.case_evidence_items e ON e.case_id = c.id
    AND e.created_at < sqlc.arg('to_at')::timestamptz
WHERE (sqlc.narg('from_at')::timestamptz IS NULL OR c.created_at >= sqlc.narg('from_at')::timestamptz)
  AND c.created_at < sqlc.arg('to_at')::timestamptz
  AND (
      c.status IN ('in_review', 'reopened')
      OR d.decision IN ('stop', 'review')
      OR d.evidence_exception = TRUE
      OR EXISTS (
          SELECT 1
          FROM ops.case_evidence_items ce
          WHERE ce.case_id = c.id
            AND ce.evidence_status = 'conflicting'
            AND ce.created_at < sqlc.arg('to_at')::timestamptz
      )
      OR NOT EXISTS (
          SELECT 1
          FROM ops.case_evidence_items ce
          WHERE ce.case_id = c.id
            AND ce.evidence_status = 'confirmed'
            AND ce.created_at < sqlc.arg('to_at')::timestamptz
      )
  )
GROUP BY c.id, c.case_reference, c.status, ml.customer_status, o.name, c.created_at, d.decision, d.evidence_exception
ORDER BY age_seconds DESC
LIMIT 12;
