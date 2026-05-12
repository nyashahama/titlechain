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

-- name: FindPropertySummaryCandidates :many
WITH submitted AS (
    SELECT
        NULLIF(BTRIM(sqlc.arg('title_reference')::text), '') AS title_reference,
        NULLIF(BTRIM(sqlc.arg('property_description')::text), '') AS property_description,
        NULLIF(BTRIM(sqlc.arg('locality_or_area')::text), '') AS locality_or_area,
        NULLIF(BTRIM(sqlc.arg('municipality_or_deeds_office')::text), '') AS municipality_or_deeds_office
),
scored AS (
    SELECT
        ps.property_id,
        ps.property_description,
        ps.locality_or_area,
        ps.municipality_or_deeds_office,
        ps.title_reference,
        ps.current_owner_name,
        ps.status,
        ps.updated_at,
        CASE
            WHEN submitted.title_reference IS NOT NULL
                AND LOWER(BTRIM(ps.title_reference)) = LOWER(submitted.title_reference)
                THEN 100
            WHEN submitted.property_description IS NOT NULL
                AND NULLIF(BTRIM(ps.property_description), '') IS NOT NULL
                AND LOWER(BTRIM(ps.property_description)) = LOWER(submitted.property_description)
                AND (
                    submitted.locality_or_area IS NULL
                    OR NULLIF(BTRIM(ps.locality_or_area), '') IS NULL
                    OR LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
                )
                AND (
                    submitted.municipality_or_deeds_office IS NULL
                    OR NULLIF(BTRIM(ps.municipality_or_deeds_office), '') IS NULL
                    OR LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
                )
                THEN 85
            WHEN submitted.property_description IS NOT NULL
                AND NULLIF(BTRIM(ps.property_description), '') IS NOT NULL
                AND (
                    LOWER(ps.property_description) LIKE '%' || LOWER(submitted.property_description) || '%'
                    OR LOWER(submitted.property_description) LIKE '%' || LOWER(ps.property_description) || '%'
                )
                AND (
                    submitted.locality_or_area IS NULL
                    OR NULLIF(BTRIM(ps.locality_or_area), '') IS NULL
                    OR LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
                )
                AND (
                    submitted.municipality_or_deeds_office IS NULL
                    OR NULLIF(BTRIM(ps.municipality_or_deeds_office), '') IS NULL
                    OR LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
                )
                THEN 70
            WHEN submitted.locality_or_area IS NOT NULL
                AND submitted.municipality_or_deeds_office IS NOT NULL
                AND LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
                AND LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
                THEN 60
            WHEN submitted.locality_or_area IS NOT NULL
                AND LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
                THEN 55
            WHEN submitted.municipality_or_deeds_office IS NOT NULL
                AND LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
                THEN 50
            ELSE 0
        END::int AS confidence_score,
        COUNT(sl.id)::int AS source_provenance_count
    FROM read.property_summaries ps
    CROSS JOIN submitted
    LEFT JOIN core.source_links sl ON sl.property_id = ps.property_id
    WHERE (
        submitted.title_reference IS NOT NULL
            AND LOWER(BTRIM(ps.title_reference)) = LOWER(submitted.title_reference)
    ) OR (
        submitted.property_description IS NOT NULL
            AND NULLIF(BTRIM(ps.property_description), '') IS NOT NULL
            AND LOWER(BTRIM(ps.property_description)) = LOWER(submitted.property_description)
            AND (
                submitted.locality_or_area IS NULL
                OR NULLIF(BTRIM(ps.locality_or_area), '') IS NULL
                OR LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
            )
            AND (
                submitted.municipality_or_deeds_office IS NULL
                OR NULLIF(BTRIM(ps.municipality_or_deeds_office), '') IS NULL
                OR LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
            )
    ) OR (
        submitted.property_description IS NOT NULL
            AND NULLIF(BTRIM(ps.property_description), '') IS NOT NULL
            AND (
                LOWER(ps.property_description) LIKE '%' || LOWER(submitted.property_description) || '%'
                OR LOWER(submitted.property_description) LIKE '%' || LOWER(ps.property_description) || '%'
            )
            AND (
                submitted.locality_or_area IS NULL
                OR NULLIF(BTRIM(ps.locality_or_area), '') IS NULL
                OR LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
            )
            AND (
                submitted.municipality_or_deeds_office IS NULL
                OR NULLIF(BTRIM(ps.municipality_or_deeds_office), '') IS NULL
                OR LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
            )
    ) OR (
        submitted.locality_or_area IS NOT NULL
            AND LOWER(BTRIM(ps.locality_or_area)) = LOWER(submitted.locality_or_area)
    ) OR (
        submitted.municipality_or_deeds_office IS NOT NULL
            AND LOWER(BTRIM(ps.municipality_or_deeds_office)) = LOWER(submitted.municipality_or_deeds_office)
    )
    GROUP BY ps.property_id, ps.property_description, ps.locality_or_area,
             ps.municipality_or_deeds_office, ps.title_reference,
             ps.current_owner_name, ps.status, ps.updated_at,
             submitted.title_reference, submitted.property_description,
             submitted.locality_or_area, submitted.municipality_or_deeds_office
)
SELECT property_id, property_description, locality_or_area, municipality_or_deeds_office,
       title_reference, current_owner_name, status, updated_at,
       confidence_score, source_provenance_count
FROM scored
WHERE confidence_score > 0
ORDER BY confidence_score DESC, source_provenance_count DESC, updated_at DESC, property_id
LIMIT 5;

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

-- name: ListCoreSourceLinksByProperty :many
SELECT id, property_id, batch_id, source_record_id, fact_table, fact_id, created_at
FROM core.source_links
WHERE property_id = $1
ORDER BY created_at, fact_table, fact_id;
