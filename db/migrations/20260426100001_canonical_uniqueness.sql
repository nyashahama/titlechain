-- +goose Up
ALTER TABLE core.title_registrations ADD CONSTRAINT uk_title_registrations_property_title UNIQUE (property_id, title_reference);
ALTER TABLE core.property_parties ADD CONSTRAINT uk_property_parties_property_party UNIQUE (property_id, party_name, party_role);
ALTER TABLE core.encumbrances ADD CONSTRAINT uk_encumbrances_property_type UNIQUE (property_id, encumbrance_type);
ALTER TABLE core.source_links ADD CONSTRAINT uk_source_links_record_fact UNIQUE (source_record_id, fact_table, fact_id);

-- +goose Down
ALTER TABLE core.source_links DROP CONSTRAINT IF EXISTS uk_source_links_record_fact;
ALTER TABLE core.encumbrances DROP CONSTRAINT IF EXISTS uk_encumbrances_property_type;
ALTER TABLE core.property_parties DROP CONSTRAINT IF EXISTS uk_property_parties_property_party;
ALTER TABLE core.title_registrations DROP CONSTRAINT IF EXISTS uk_title_registrations_property_title;
