package jobs

import "context"

type Repository interface {
	ListRunsWithCounts(ctx context.Context, limit int32) ([]RunSummary, error)
	FindActiveRun(ctx context.Context, runType string) (*RunSummary, error)
	CreateSeedProjectionRun(ctx context.Context) (RunSummary, error)
	CreateSourceIngestionRun(ctx context.Context, req StartSourceIngestionRequest) (RunSummary, error)
}
