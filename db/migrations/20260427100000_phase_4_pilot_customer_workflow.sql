-- +goose Up
CREATE SCHEMA IF NOT EXISTS pilot;

CREATE TABLE pilot.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pilot.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES pilot.organizations(id),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('pilot_admin', 'member')),
    password_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pilot.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES pilot.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE TABLE pilot.matter_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES pilot.organizations(id),
    created_by_user_id UUID NOT NULL REFERENCES pilot.users(id),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    customer_reference TEXT,
    customer_status TEXT NOT NULL CHECK (customer_status IN ('submitted', 'in_review', 'resolved', 'reopened')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_customer_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pilot.summary_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_link_id UUID NOT NULL REFERENCES pilot.matter_links(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES pilot.users(id),
    format TEXT NOT NULL CHECK (format IN ('html_print')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pilot_users_org_idx ON pilot.users(organization_id);
CREATE INDEX pilot_sessions_token_hash_idx ON pilot.sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX pilot_sessions_user_idx ON pilot.sessions(user_id);
CREATE INDEX pilot_matter_links_org_idx ON pilot.matter_links(organization_id, submitted_at DESC);
CREATE UNIQUE INDEX pilot_matter_links_case_idx ON pilot.matter_links(case_id);
CREATE INDEX pilot_summary_exports_matter_idx ON pilot.summary_exports(matter_link_id, created_at DESC);

INSERT INTO pilot.organizations (id, name, slug, status)
VALUES ('00000000-0000-4000-8000-000000000001', 'Hama & Associates Inc', 'hama-associates', 'active');

INSERT INTO pilot.users (id, organization_id, email, display_name, role, password_hash)
VALUES (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    'demo@titlechain.co.za',
    'Nyasha Hama',
    'pilot_admin',
    'phase4-dev-sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d'
);

-- +goose Down
DROP TABLE IF EXISTS pilot.summary_exports;
DROP INDEX IF EXISTS pilot_matter_links_case_idx;
DROP TABLE IF EXISTS pilot.matter_links;
DROP TABLE IF EXISTS pilot.sessions;
DROP TABLE IF EXISTS pilot.users;
DROP TABLE IF EXISTS pilot.organizations;
DROP SCHEMA IF EXISTS pilot;
