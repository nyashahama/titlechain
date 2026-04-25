package jobs

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

const RunTypeSeedPropertyProjection = "seed_property_projection"
const RunTypeSourceIngestionV1 = "source_ingestion_v1"

var ErrActiveRun = errors.New("an active run of this type already exists")
var ErrValidation = errors.New("validation error")

type Service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return Service{repo: repo}
}

func (s Service) ListRuns(ctx context.Context) ([]RunSummary, error) {
	return s.repo.ListRunsWithCounts(ctx, 20)
}

func (s Service) StartSeedPropertyProjection(ctx context.Context) (RunSummary, error) {
	// The DB partial unique index on ops.runs(run_type) WHERE status IN ('pending', 'running')
	// enforces atomic active-run protection. A 23505 violation is translated to ErrActiveRun
	// by the repository layer.
	return s.repo.CreateSeedProjectionRun(ctx)
}

func (s Service) StartSourceIngestion(ctx context.Context, req StartSourceIngestionRequest) (RunSummary, error) {
	if strings.TrimSpace(req.SourceName) == "" {
		return RunSummary{}, fmt.Errorf("%w: source_name is required", ErrValidation)
	}
	if strings.TrimSpace(req.BatchKey) == "" {
		return RunSummary{}, fmt.Errorf("%w: batch_key is required", ErrValidation)
	}
	// The DB partial unique index on ops.runs(run_type) WHERE status IN ('pending', 'running')
	// enforces atomic active-run protection. A 23505 violation is translated to ErrActiveRun
	// by the repository layer.
	return s.repo.CreateSourceIngestionRun(ctx, req)
}
