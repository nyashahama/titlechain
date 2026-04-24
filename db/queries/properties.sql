-- name: ListPropertySummaries :many
SELECT property_id, property_description, locality_or_area, municipality_or_deeds_office,
       title_reference, current_owner_name, status, updated_at
FROM read.property_summaries
WHERE (sqlc.narg('query')::text IS NULL
        OR lower(property_description) LIKE '%' || lower(sqlc.narg('query')::text) || '%'
        OR lower(title_reference) LIKE '%' || lower(sqlc.narg('query')::text) || '%')
  AND (sqlc.narg('locality')::text IS NULL OR lower(locality_or_area) = lower(sqlc.narg('locality')::text))
  AND (sqlc.narg('status')::text IS NULL OR lower(status) = lower(sqlc.narg('status')::text))
ORDER BY updated_at DESC
LIMIT sqlc.arg('limit');

-- name: GetPropertySummary :one
SELECT property_id, property_description, locality_or_area, municipality_or_deeds_office,
       title_reference, current_owner_name, status, updated_at
FROM read.property_summaries
WHERE property_id = $1;

-- name: UpsertPropertySummary :exec
INSERT INTO read.property_summaries (
    property_id, property_description, locality_or_area,
    municipality_or_deeds_office, title_reference,
    current_owner_name, status, updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW()
) ON CONFLICT (property_id) DO UPDATE SET
    property_description = EXCLUDED.property_description,
    locality_or_area = EXCLUDED.locality_or_area,
    municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
    title_reference = EXCLUDED.title_reference,
    current_owner_name = EXCLUDED.current_owner_name,
    status = EXCLUDED.status,
    updated_at = NOW();