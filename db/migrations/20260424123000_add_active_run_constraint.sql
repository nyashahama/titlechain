-- +goose Up
CREATE UNIQUE INDEX idx_runs_one_active_per_type ON ops.runs(run_type) WHERE status IN ('pending', 'running');
