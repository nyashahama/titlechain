-- name: CreateSourceBatch :one
INSERT INTO raw.batches (source_name, source_batch_key, payload_uri, payload_sha256)
VALUES ($1, $2, $3, $4)
RETURNING id, source_name, source_batch_key, payload_uri, payload_sha256, imported_at, created_at;

-- name: InsertRawRecord :exec
INSERT INTO raw.records (batch_id, record_key, record_type, payload, payload_sha256)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (batch_id, record_key) DO NOTHING;
