-- name: ListRuns :many
SELECT id, batch_id, run_type, status, started_at, finished_at, created_at, updated_at
FROM ops.runs
ORDER BY created_at DESC
LIMIT $1;

-- name: CreateRun :one
INSERT INTO ops.runs (batch_id, run_type, status)
VALUES ($1, $2, $3)
RETURNING id, batch_id, run_type, status, started_at, finished_at, created_at, updated_at;

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
