-- +goose Up
ALTER TABLE read.property_summaries
    ADD COLUMN IF NOT EXISTS property_description TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS locality_or_area TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS municipality_or_deeds_office TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS current_owner_name TEXT;

CREATE INDEX IF NOT EXISTS idx_property_summaries_desc_lower
    ON read.property_summaries (lower(property_description));

CREATE INDEX IF NOT EXISTS idx_property_summaries_locality_lower
    ON read.property_summaries (lower(locality_or_area));

CREATE INDEX IF NOT EXISTS idx_property_summaries_municipality_lower
    ON read.property_summaries (lower(municipality_or_deeds_office));

CREATE INDEX IF NOT EXISTS idx_property_summaries_title_ref_lower
    ON read.property_summaries (lower(title_reference));

-- +goose Down
DROP INDEX IF EXISTS read.idx_property_summaries_title_ref_lower;
DROP INDEX IF EXISTS read.idx_property_summaries_municipality_lower;
DROP INDEX IF EXISTS read.idx_property_summaries_locality_lower;
DROP INDEX IF EXISTS read.idx_property_summaries_desc_lower;

ALTER TABLE read.property_summaries
    DROP COLUMN IF EXISTS current_owner_name,
    DROP COLUMN IF EXISTS municipality_or_deeds_office,
    DROP COLUMN IF EXISTS locality_or_area,
    DROP COLUMN IF EXISTS property_description;