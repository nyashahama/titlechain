-- +goose Up
CREATE TABLE ops.analysts (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.reason_codes (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('clear_support', 'hard_block', 'review_trigger', 'unresolved_information')),
    is_hard_block BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.seed_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_description TEXT NOT NULL,
    locality_or_area TEXT NOT NULL,
    municipality_or_deeds_office TEXT NOT NULL,
    title_reference TEXT,
    current_owner_name TEXT,
    status_summary TEXT NOT NULL,
    seeded_risk JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_reference TEXT NOT NULL UNIQUE,
    property_description TEXT NOT NULL,
    locality_or_area TEXT NOT NULL,
    municipality_or_deeds_office TEXT NOT NULL,
    title_reference TEXT,
    matter_reference TEXT,
    intake_note TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_review', 'resolved', 'closed_unresolved', 'reopened')),
    assignee_id TEXT NOT NULL REFERENCES ops.analysts(id),
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    linked_seed_property_id UUID REFERENCES ops.seed_properties(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_property_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    seed_property_id UUID NOT NULL REFERENCES ops.seed_properties(id),
    match_source TEXT NOT NULL,
    confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    status TEXT NOT NULL CHECK (status IN ('candidate', 'confirmed', 'rejected')),
    confirmed_by TEXT REFERENCES ops.analysts(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer', 'conveyancer', 'other')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'company', 'unknown')),
    display_name TEXT NOT NULL,
    identifier TEXT,
    note TEXT,
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    external_reference TEXT,
    excerpt TEXT,
    extracted_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_status TEXT NOT NULL CHECK (evidence_status IN ('captured', 'confirmed', 'conflicting', 'superseded')),
    analyst_note TEXT,
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.case_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('clear', 'review', 'stop')),
    note TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
    created_by TEXT NOT NULL REFERENCES ops.analysts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    superseded_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX case_decisions_one_current_per_case
    ON ops.case_decisions(case_id)
    WHERE status = 'current';

CREATE TABLE ops.case_decision_reason_codes (
    decision_id UUID NOT NULL REFERENCES ops.case_decisions(id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL REFERENCES ops.reason_codes(code),
    PRIMARY KEY (decision_id, reason_code)
);

CREATE TABLE ops.case_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL REFERENCES ops.analysts(id),
    event_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX case_records_status_idx ON ops.case_records(status);
CREATE INDEX case_records_assignee_idx ON ops.case_records(assignee_id);
CREATE INDEX case_property_matches_case_idx ON ops.case_property_matches(case_id);
CREATE INDEX case_evidence_items_case_idx ON ops.case_evidence_items(case_id);
CREATE INDEX case_parties_case_idx ON ops.case_parties(case_id);
CREATE INDEX case_audit_events_case_idx ON ops.case_audit_events(case_id, created_at DESC);

INSERT INTO ops.analysts (id, display_name, email) VALUES
    ('ana-001', 'Nyasha Hama', 'nyasha@titlechain.local'),
    ('ana-002', 'Amina Patel', 'amina@titlechain.local'),
    ('ana-003', 'Thabo Mokoena', 'thabo@titlechain.local');

INSERT INTO ops.reason_codes (code, label, category, is_hard_block, sort_order) VALUES
    ('TITLE_SEARCH_CLEAN', 'Title search found no material blocker', 'clear_support', FALSE, 10),
    ('ENCUMBRANCE_CHECK_CLEAN', 'Encumbrance check found no active blocker', 'clear_support', FALSE, 20),
    ('OWNERSHIP_CHAIN_CONFIRMED', 'Ownership chain aligns with supplied matter', 'clear_support', FALSE, 30),
    ('ACTIVE_INTERDICT', 'Active interdict or transfer restriction found', 'hard_block', TRUE, 100),
    ('TITLE_DEED_MISMATCH', 'Supplied title reference conflicts with evidence', 'hard_block', TRUE, 110),
    ('REGISTERED_BOND_CONFLICT', 'Registered bond or encumbrance conflicts with matter', 'hard_block', TRUE, 120),
    ('OWNERSHIP_CONFLICT', 'Current owner evidence conflicts with supplied matter', 'review_trigger', FALSE, 200),
    ('PARTY_NAME_VARIANCE', 'Party name or entity details require review', 'review_trigger', FALSE, 210),
    ('SOURCE_CONFLICT', 'Available sources disagree on material facts', 'review_trigger', FALSE, 220),
    ('FRAUD_SIGNAL_PRESENT', 'Fraud or anomaly signal requires review', 'review_trigger', FALSE, 230),
    ('MISSING_TITLE_REFERENCE', 'Title reference missing or unverifiable', 'unresolved_information', FALSE, 300),
    ('INSUFFICIENT_SOURCE_COVERAGE', 'Available evidence is insufficient for a defensible decision', 'unresolved_information', FALSE, 310);

INSERT INTO ops.seed_properties (
    property_description,
    locality_or_area,
    municipality_or_deeds_office,
    title_reference,
    current_owner_name,
    status_summary,
    seeded_risk
) VALUES
    ('Erf 412 Rosebank Township', 'Rosebank', 'Johannesburg', 'T12345/2024', 'Maseko Family Trust', 'No material blocker seeded', '{"scenario":"clear"}'::jsonb),
    ('Section 8 SS Harbor View', 'Umhlanga', 'Durban', 'ST7788/2023', 'Harbor View Holdings Pty Ltd', 'Ownership variance seeded', '{"scenario":"review","signal":"ownership_conflict"}'::jsonb),
    ('Erf 91 Observatory', 'Observatory', 'Cape Town', 'T9988/2022', 'Ndlovu Property Holdings', 'Active interdict seeded', '{"scenario":"stop","blocker":"active_interdict"}'::jsonb),
    ('Farm Portion 17 Rietfontein', 'Rietfontein', 'Pretoria', NULL, 'Unknown', 'Insufficient title reference seeded', '{"scenario":"unresolved","missing":"title_reference"}'::jsonb);
