-- name: ListRuns :many
SELECT id, batch_id, run_type, status, started_at, finished_at, created_at, updated_at
FROM ops.runs
ORDER BY created_at DESC
LIMIT $1;

-- name: CreateRun :one
INSERT INTO ops.runs (batch_id, run_type, status)
VALUES ($1, $2, $3)
RETURNING id, batch_id, run_type, status, started_at, finished_at, created_at, updated_at;

-- name: FindActiveRun :one
SELECT id, batch_id, run_type, status, started_at, finished_at, created_at, updated_at
FROM ops.runs
WHERE run_type = $1
  AND status IN ('pending', 'running')
ORDER BY created_at DESC
LIMIT 1;

-- name: CreateBatch :one
INSERT INTO raw.batches (source_name, source_batch_key, payload_sha256)
VALUES ($1, $2, $3)
RETURNING id, source_name, source_batch_key, payload_uri, payload_sha256, imported_at, created_at;

-- name: CreateJob :one
INSERT INTO ops.jobs (run_id, job_kind, status)
VALUES ($1, $2, 'pending')
RETURNING id, run_id, job_kind, status, lease_owner, lease_expires_at, retry_count, checkpoint, error_message, created_at, updated_at;

-- name: ListRunsWithCounts :many
SELECT r.id, r.run_type, r.status, r.started_at, r.finished_at, r.created_at,
       COUNT(j.id)::int AS total_jobs,
       COUNT(*) FILTER (WHERE j.status = 'completed')::int AS completed_jobs,
       COUNT(*) FILTER (WHERE j.status = 'failed')::int AS failed_jobs,
       MAX(j.error_message) AS latest_error
FROM ops.runs r
LEFT JOIN ops.jobs j ON j.run_id = r.id
GROUP BY r.id
ORDER BY r.created_at DESC
LIMIT $1;

-- name: ClaimNextJob :one
WITH candidate AS (
    SELECT id
    FROM ops.jobs
    WHERE status = 'pending'
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
)
UPDATE ops.jobs
SET status = 'leased',
    lease_owner = $1,
    lease_expires_at = $2,
    updated_at = NOW()
WHERE id = (SELECT id FROM candidate)
RETURNING id, run_id, job_kind, status, lease_owner, lease_expires_at, retry_count, checkpoint, error_message, created_at, updated_at;
