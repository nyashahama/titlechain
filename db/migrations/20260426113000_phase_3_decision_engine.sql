-- +goose Up
CREATE TABLE ops.case_decision_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES ops.case_records(id) ON DELETE CASCADE,
    engine_version TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('clear', 'review', 'stop')),
    summary TEXT NOT NULL,
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('current', 'superseded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    superseded_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX case_decision_proposals_one_current_per_case
    ON ops.case_decision_proposals(case_id)
    WHERE status = 'current';

CREATE TABLE ops.case_decision_proposal_reason_codes (
    proposal_id UUID NOT NULL REFERENCES ops.case_decision_proposals(id) ON DELETE CASCADE,
    reason_code TEXT NOT NULL REFERENCES ops.reason_codes(code),
    PRIMARY KEY (proposal_id, reason_code)
);

ALTER TABLE ops.case_decisions
    ADD COLUMN decision_source TEXT NOT NULL DEFAULT 'manual'
        CHECK (decision_source IN ('manual', 'accepted_proposal', 'manual_override')),
    ADD COLUMN proposal_id UUID REFERENCES ops.case_decision_proposals(id);

INSERT INTO ops.reason_codes (code, label, category, is_hard_block, sort_order)
VALUES ('SOURCE_RECORD_QUARANTINED', 'Source record quarantined', 'review_trigger', FALSE, 225)
ON CONFLICT (code) DO NOTHING;

-- +goose Down
DELETE FROM ops.reason_codes WHERE code = 'SOURCE_RECORD_QUARANTINED';

ALTER TABLE ops.case_decisions
    DROP COLUMN IF EXISTS proposal_id,
    DROP COLUMN IF EXISTS decision_source;

DROP TABLE IF EXISTS ops.case_decision_proposal_reason_codes;
DROP INDEX IF EXISTS case_decision_proposals_one_current_per_case;
DROP TABLE IF EXISTS ops.case_decision_proposals;
