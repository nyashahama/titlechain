package jobs

import (
	"context"
	"testing"
)

type stubRepo struct {
	runs      []RunSummary
	activeRun *RunSummary
	createErr error
}

func (r *stubRepo) ListRunsWithCounts(_ context.Context, _ int32) ([]RunSummary, error) {
	return r.runs, nil
}

func (r *stubRepo) FindActiveRun(_ context.Context, _ string) (*RunSummary, error) {
	return r.activeRun, nil
}

func (r *stubRepo) CreateSeedProjectionRun(_ context.Context) (RunSummary, error) {
	if r.createErr != nil {
		return RunSummary{}, r.createErr
	}
	return RunSummary{
		ID:      "run-1",
		RunType: RunTypeSeedPropertyProjection,
		Status:  "pending",
	}, nil
}

func TestService_ListRuns(t *testing.T) {
	repo := &stubRepo{
		runs: []RunSummary{
			{ID: "run-1", RunType: "seed_property_projection", Status: "completed", TotalJobs: 5, CompletedJobs: 5},
		},
	}
	svc := NewService(repo)

	runs, err := svc.ListRuns(context.Background())
	if err != nil {
		t.Fatalf("list runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("runs = %d, want 1", len(runs))
	}
	if runs[0].ID != "run-1" {
		t.Errorf("id = %s, want run-1", runs[0].ID)
	}
}

func TestService_StartSeedPropertyProjectionRejectsActiveRun(t *testing.T) {
	repo := &stubRepo{
		activeRun: &RunSummary{
			ID:      "run-active",
			RunType: RunTypeSeedPropertyProjection,
			Status:  "running",
		},
	}
	svc := NewService(repo)

	_, err := svc.StartSeedPropertyProjection(context.Background())
	if err == nil {
		t.Fatal("expected error for active run, got nil")
	}
	if err != ErrActiveRun {
		t.Errorf("error = %v, want ErrActiveRun", err)
	}
}

func TestService_StartSeedPropertyProjectionCreatesRun(t *testing.T) {
	repo := &stubRepo{}
	svc := NewService(repo)

	run, err := svc.StartSeedPropertyProjection(context.Background())
	if err != nil {
		t.Fatalf("start seed projection: %v", err)
	}
	if run.RunType != RunTypeSeedPropertyProjection {
		t.Errorf("run_type = %s, want %s", run.RunType, RunTypeSeedPropertyProjection)
	}
	if run.Status != "pending" {
		t.Errorf("status = %s, want pending", run.Status)
	}
}

func TestService_StartSeedPropertyProjectionAllowsSequentialRuns(t *testing.T) {
	repo := &stubRepo{}
	svc := NewService(repo)
	ctx := context.Background()

	_, err := svc.StartSeedPropertyProjection(ctx)
	if err != nil {
		t.Fatalf("first run: %v", err)
	}

	repo.activeRun = nil
	_, err = svc.StartSeedPropertyProjection(ctx)
	if err != nil {
		t.Fatalf("second run: %v", err)
	}
}