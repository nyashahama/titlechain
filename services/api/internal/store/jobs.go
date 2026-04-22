package store

import (
	"context"

	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type JobsStore struct {
	queries *sqlc.Queries
}

func NewJobsStore(queries *sqlc.Queries) JobsStore {
	return JobsStore{queries: queries}
}

func (s JobsStore) ListRuns(ctx context.Context, limit int32) ([]sqlc.OpsRun, error) {
	return s.queries.ListRuns(ctx, limit)
}
