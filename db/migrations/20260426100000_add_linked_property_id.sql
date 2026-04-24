-- +goose Up
ALTER TABLE ops.case_records ADD COLUMN IF NOT EXISTS linked_property_id UUID REFERENCES core.properties(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_case_records_linked_property_id ON ops.case_records(linked_property_id) WHERE linked_property_id IS NOT NULL;

-- +goose Down
DROP INDEX IF EXISTS idx_case_records_linked_property_id;
ALTER TABLE ops.case_records DROP COLUMN IF EXISTS linked_property_id;