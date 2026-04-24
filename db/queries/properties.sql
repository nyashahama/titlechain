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

-- name: UpsertCoreProperty :one
INSERT INTO core.properties (property_fingerprint, municipality_or_deeds_office, property_description, latest_title_reference)
VALUES ($1, $2, $3, $4)
ON CONFLICT (property_fingerprint) DO UPDATE
SET municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
    property_description = EXCLUDED.property_description,
    latest_title_reference = EXCLUDED.latest_title_reference,
    updated_at = NOW()
RETURNING id, property_fingerprint, municipality_or_deeds_office, property_description, latest_title_reference, created_at, updated_at;

-- name: RefreshPropertySummaryFromCore :exec
INSERT INTO read.property_summaries (
    property_id, property_description, locality_or_area,
    municipality_or_deeds_office, title_reference,
    current_owner_name, status, updated_at
)
-- locality_or_area falls back to municipality_or_deeds_office since core.properties does not have a separate locality column
SELECT p.id,
       p.property_description,
       p.municipality_or_deeds_office,
       p.municipality_or_deeds_office,
       p.latest_title_reference,
       MAX(pp.party_name) FILTER (WHERE pp.party_role = 'owner'),
       COALESCE(MAX(e.status) FILTER (WHERE e.status != ''), 'normalized'),
       NOW()
FROM core.properties p
LEFT JOIN core.property_parties pp ON pp.property_id = p.id
LEFT JOIN core.encumbrances e ON e.property_id = p.id
WHERE p.id = $1
GROUP BY p.id, p.property_description, p.municipality_or_deeds_office, p.latest_title_reference
ON CONFLICT (property_id) DO UPDATE
SET property_description = EXCLUDED.property_description,
    locality_or_area = EXCLUDED.locality_or_area,
    municipality_or_deeds_office = EXCLUDED.municipality_or_deeds_office,
    title_reference = EXCLUDED.title_reference,
    current_owner_name = EXCLUDED.current_owner_name,
    status = EXCLUDED.status,
    updated_at = NOW();

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

-- name: GetPropertySummary :one
SELECT property_id, property_description, locality_or_area, municipality_or_deeds_office, title_reference, current_owner_name, status, updated_at
FROM read.property_summaries
WHERE property_id = $1;