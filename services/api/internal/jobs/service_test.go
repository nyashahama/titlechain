package jobs

import (
	"context"
	"testing"
)

type stubRepo struct {
	runs                   []RunSummary
	activeRun              *RunSummary
	createErr              error
	lastSourceIngestionReq *StartSourceIngestionRequest
	sourceIngestionRun     RunSummary
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

func (r *stubRepo) CreateSourceIngestionRun(_ context.Context, req StartSourceIngestionRequest) (RunSummary, error) {
	r.lastSourceIngestionReq = &req
	if r.sourceIngestionRun.ID != "" {
		return r.sourceIngestionRun, nil
	}
	return RunSummary{
		ID:      "run-2",
		RunType: RunTypeSourceIngestionV1,
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

func TestService_StartSourceIngestionRejectsActiveRun(t *testing.T) {
	repo := &stubRepo{
		activeRun: &RunSummary{
			ID:      "run-active",
			RunType: RunTypeSourceIngestionV1,
			Status:  "running",
		},
	}
	svc := NewService(repo)

	_, err := svc.StartSourceIngestion(context.Background(), StartSourceIngestionRequest{
		SourceName: "pilot.deeds_snapshot",
		BatchKey:   "2026-04-25-main",
	})
	if err == nil {
		t.Fatal("expected error for active run, got nil")
	}
	if err != ErrActiveRun {
		t.Errorf("error = %v, want ErrActiveRun", err)
	}
}

func TestService_StartSourceIngestionCreatesFourStageRun(t *testing.T) {
	repo := &stubRepo{
		sourceIngestionRun: RunSummary{
			ID:        "run-svc-2",
			RunType:   RunTypeSourceIngestionV1,
			Status:    "pending",
			TotalJobs: 4,
		},
	}
	svc := NewService(repo)

	run, err := svc.StartSourceIngestion(context.Background(), StartSourceIngestionRequest{
		SourceName: "pilot.deeds_snapshot",
		BatchKey:   "2026-04-25-main",
	})
	if err != nil {
		t.Fatalf("start source ingestion: %v", err)
	}
	if run.ID != "run-svc-2" {
		t.Errorf("run id = %s, want run-svc-2", run.ID)
	}
	if run.RunType != RunTypeSourceIngestionV1 {
		t.Errorf("run_type = %s, want %s", run.RunType, RunTypeSourceIngestionV1)
	}
	if run.TotalJobs != 4 {
		t.Errorf("total_jobs = %d, want 4", run.TotalJobs)
	}
	if repo.lastSourceIngestionReq == nil {
		t.Fatal("expected request to be passed to repository, got nil")
	}
	if repo.lastSourceIngestionReq.SourceName != "pilot.deeds_snapshot" {
		t.Errorf("source_name = %s, want pilot.deeds_snapshot", repo.lastSourceIngestionReq.SourceName)
	}
	if repo.lastSourceIngestionReq.BatchKey != "2026-04-25-main" {
		t.Errorf("batch_key = %s, want 2026-04-25-main", repo.lastSourceIngestionReq.BatchKey)
	}
}

func TestService_StartSourceIngestionRejectsEmptySourceName(t *testing.T) {
	tests := []struct {
		name       string
		sourceName string
		batchKey   string
		wantErr    string
	}{
		{"empty source_name", "", "2026-04-25-main", "source_name is required"},
		{"whitespace source_name", "   ", "2026-04-25-main", "source_name is required"},
		{"empty batch_key", "pilot.deeds_snapshot", "", "batch_key is required"},
		{"whitespace batch_key", "pilot.deeds_snapshot", "\t\n", "batch_key is required"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &stubRepo{}
			svc := NewService(repo)
			_, err := svc.StartSourceIngestion(context.Background(), StartSourceIngestionRequest{
				SourceName: tt.sourceName,
				BatchKey:   tt.batchKey,
			})
			if err == nil {
				t.Fatal("expected error, got nil")
			}
			if err.Error() != tt.wantErr {
				t.Errorf("error = %q, want %q", err.Error(), tt.wantErr)
			}
		})
	}
}
