package jobs

import (
	"context"
	"errors"
	"strings"
)

const RunTypeSeedPropertyProjection = "seed_property_projection"
const RunTypeSourceIngestionV1 = "source_ingestion_v1"

var ErrActiveRun = errors.New("an active run of this type already exists")

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
	active, err := s.repo.FindActiveRun(ctx, RunTypeSeedPropertyProjection)
	if err != nil {
		return RunSummary{}, err
	}
	if active != nil {
		return RunSummary{}, ErrActiveRun
	}
	return s.repo.CreateSeedProjectionRun(ctx)
}

func (s Service) StartSourceIngestion(ctx context.Context, req StartSourceIngestionRequest) (RunSummary, error) {
	if strings.TrimSpace(req.SourceName) == "" {
		return RunSummary{}, errors.New("source_name is required")
	}
	if strings.TrimSpace(req.BatchKey) == "" {
		return RunSummary{}, errors.New("batch_key is required")
	}
	active, err := s.repo.FindActiveRun(ctx, RunTypeSourceIngestionV1)
	if err != nil {
		return RunSummary{}, err
	}
	if active != nil {
		return RunSummary{}, ErrActiveRun
	}
	return s.repo.CreateSourceIngestionRun(ctx, req)
}
