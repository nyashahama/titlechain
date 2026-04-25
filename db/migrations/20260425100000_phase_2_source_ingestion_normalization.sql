-- +goose Up
-- +goose StatementBegin

-- Enforce at most one active run per run_type atomically
CREATE UNIQUE INDEX idx_runs_active_unique ON ops.runs(run_type) WHERE status IN ('pending', 'running');

CREATE TABLE raw.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    record_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    payload_sha256 TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (batch_id, record_key)
);

CREATE TABLE stage.property_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    municipality_or_deeds_office TEXT NOT NULL,
    property_description TEXT NOT NULL,
    title_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage.title_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    title_reference TEXT NOT NULL,
    registration_status TEXT NOT NULL,
    effective_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage.party_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    title_reference TEXT NOT NULL,
    party_name TEXT NOT NULL,
    party_role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage.encumbrance_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    title_reference TEXT NOT NULL,
    encumbrance_type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stage.quarantined_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    record_key TEXT NOT NULL,
    reason TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_fingerprint TEXT NOT NULL UNIQUE,
    municipality_or_deeds_office TEXT NOT NULL,
    property_description TEXT NOT NULL,
    latest_title_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.title_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES core.properties(id) ON DELETE CASCADE,
    title_reference TEXT NOT NULL,
    registration_status TEXT NOT NULL,
    effective_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.property_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES core.properties(id) ON DELETE CASCADE,
    party_name TEXT NOT NULL,
    party_role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.encumbrances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES core.properties(id) ON DELETE CASCADE,
    encumbrance_type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.source_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES core.properties(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES raw.batches(id) ON DELETE CASCADE,
    source_record_id UUID NOT NULL REFERENCES raw.records(id) ON DELETE CASCADE,
    fact_table TEXT NOT NULL,
    fact_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS core.source_links;
DROP TABLE IF EXISTS core.encumbrances;
DROP TABLE IF EXISTS core.property_parties;
DROP TABLE IF EXISTS core.title_registrations;
DROP TABLE IF EXISTS core.properties;
DROP TABLE IF EXISTS stage.quarantined_records;
DROP TABLE IF EXISTS stage.encumbrance_rows;
DROP TABLE IF EXISTS stage.party_rows;
DROP TABLE IF EXISTS stage.title_rows;
DROP TABLE IF EXISTS stage.property_rows;
DROP INDEX IF EXISTS idx_runs_active_unique;
DROP TABLE IF EXISTS raw.records;

-- +goose StatementEnd
