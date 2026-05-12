-- +goose Up
ALTER TABLE ops.case_decisions
    ADD COLUMN IF NOT EXISTS evidence_exception BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS evidence_exception_note TEXT;

ALTER TABLE ops.case_decisions
    ADD CONSTRAINT case_decisions_exception_note_required
    CHECK (
        evidence_exception = FALSE
        OR length(trim(coalesce(evidence_exception_note, ''))) > 0
    );

-- Existing non-superseded duplicates were possible before the upsert guardrail.
WITH duplicate_evidence AS (
    SELECT id,
           row_number() OVER (
               PARTITION BY case_id, source_type, source_reference, coalesce(external_reference, ''::text), evidence_type
               ORDER BY created_at DESC, id DESC
           ) AS duplicate_rank
    FROM ops.case_evidence_items
    WHERE evidence_status != 'superseded'
)
UPDATE ops.case_evidence_items e
SET evidence_status = 'superseded'
FROM duplicate_evidence d
WHERE e.id = d.id
  AND d.duplicate_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS case_evidence_items_case_source_fact_unique
    ON ops.case_evidence_items (
        case_id,
        source_type,
        source_reference,
        (coalesce(external_reference, ''::text)),
        evidence_type
    )
    WHERE evidence_status != 'superseded';

-- +goose Down
DROP INDEX IF EXISTS ops.case_evidence_items_case_source_fact_unique;
ALTER TABLE ops.case_decisions
    DROP CONSTRAINT IF EXISTS case_decisions_exception_note_required,
    DROP COLUMN IF EXISTS evidence_exception_note,
    DROP COLUMN IF EXISTS evidence_exception;
