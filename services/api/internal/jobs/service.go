package jobs

import (
	"context"
	"errors"
)

const RunTypeSeedPropertyProjection = "seed_property_projection"

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