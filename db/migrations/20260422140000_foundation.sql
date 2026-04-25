-- +goose Up
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS stage;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS read;
CREATE SCHEMA IF NOT EXISTS ops;

CREATE TABLE raw.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    source_batch_key TEXT NOT NULL,
    payload_uri TEXT,
    payload_sha256 TEXT NOT NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_name, source_batch_key)
);

CREATE TABLE ops.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES raw.batches(id),
    run_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'failed', 'completed', 'quarantined')),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES ops.runs(id) ON DELETE CASCADE,
    job_kind TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'leased', 'running', 'failed', 'completed', 'quarantined')),
    lease_owner TEXT,
    lease_expires_at TIMESTAMPTZ,
    retry_count INTEGER NOT NULL DEFAULT 0,
    checkpoint JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops.job_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES ops.jobs(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    worker_id TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    outcome TEXT NOT NULL CHECK (outcome IN ('running', 'failed', 'completed', 'abandoned')),
    error_message TEXT,
    UNIQUE (job_id, attempt_number)
);

CREATE TABLE read.property_summaries (
    property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_reference TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


