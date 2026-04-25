-- name: GetDecisioningPropertySnapshot :one
SELECT p.id AS property_id,
       p.latest_title_reference,
       COALESCE(MAX(tr.registration_status), ''::text)::text AS title_status,
       COALESCE(BOOL_OR(lower(e.status) = 'active'), FALSE)::bool AS has_active_encumbrance,
       COALESCE(BOOL_OR(q.id IS NOT NULL), FALSE)::bool AS has_quarantined_rows,
       COUNT(DISTINCT sl.id)::int AS source_link_count
FROM core.properties p
LEFT JOIN core.title_registrations tr ON tr.property_id = p.id
LEFT JOIN core.encumbrances e ON e.property_id = p.id
LEFT JOIN core.source_links sl ON sl.property_id = p.id
LEFT JOIN stage.quarantined_records q ON q.source_record_id = sl.source_record_id
WHERE p.id = $1
GROUP BY p.id, p.latest_title_reference;

-- name: ListDecisioningPropertyParties :many
SELECT party_name, party_role
FROM core.property_parties
WHERE property_id = $1
ORDER BY party_role, party_name;
