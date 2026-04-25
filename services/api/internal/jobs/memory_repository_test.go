package jobs

import (
	"context"
	"testing"
)

func TestMemoryRepository_CreateSourceIngestionRunCreatesBatchRunAndJobs(t *testing.T) {
	repo := NewMemoryRepository()
	ctx := context.Background()

	req := StartSourceIngestionRequest{
		SourceName: "pilot.deeds_snapshot",
		BatchKey:   "2026-04-25-main",
	}

	run, err := repo.CreateSourceIngestionRun(ctx, req)
	if err != nil {
		t.Fatalf("create source ingestion run: %v", err)
	}

	if run.RunType != RunTypeSourceIngestionV1 {
		t.Errorf("run_type = %s, want %s", run.RunType, RunTypeSourceIngestionV1)
	}
	if run.Status != "pending" {
		t.Errorf("status = %s, want pending", run.Status)
	}

	batches := repo.Batches()
	if len(batches) != 1 {
		t.Fatalf("batches = %d, want 1", len(batches))
	}
	var batch memoryBatch
	for _, b := range batches {
		batch = b
	}
	if batch.SourceName != req.SourceName {
		t.Errorf("batch source_name = %s, want %s", batch.SourceName, req.SourceName)
	}
	if batch.SourceBatchKey != req.BatchKey {
		t.Errorf("batch source_batch_key = %s, want %s", batch.SourceBatchKey, req.BatchKey)
	}

	jobs := repo.Jobs(run.ID)
	if len(jobs) != 4 {
		t.Fatalf("jobs = %d, want 4", len(jobs))
	}
	for i, kind := range IngestionJobKinds {
		if jobs[i].JobKind != kind {
			t.Errorf("job[%d].kind = %s, want %s", i, jobs[i].JobKind, kind)
		}
	}
}

func TestMemoryRepository_CreateSourceIngestionRunSetsActiveRun(t *testing.T) {
	repo := NewMemoryRepository()
	ctx := context.Background()

	_, err := repo.CreateSourceIngestionRun(ctx, StartSourceIngestionRequest{
		SourceName: "src",
		BatchKey:   "batch-1",
	})
	if err != nil {
		t.Fatalf("create source ingestion run: %v", err)
	}

	active, err := repo.FindActiveRun(ctx, RunTypeSourceIngestionV1)
	if err != nil {
		t.Fatalf("find active run: %v", err)
	}
	if active == nil {
		t.Fatal("expected active run, got nil")
	}
	if active.RunType != RunTypeSourceIngestionV1 {
		t.Errorf("run_type = %s, want %s", active.RunType, RunTypeSourceIngestionV1)
	}
}

func TestMemoryRepository_CreateSeedProjectionRunCreatesBatchRunAndJob(t *testing.T) {
	repo := NewMemoryRepository()
	ctx := context.Background()

	run, err := repo.CreateSeedProjectionRun(ctx)
	if err != nil {
		t.Fatalf("create seed projection run: %v", err)
	}

	if run.RunType != RunTypeSeedPropertyProjection {
		t.Errorf("run_type = %s, want %s", run.RunType, RunTypeSeedPropertyProjection)
	}

	batches := repo.Batches()
	if len(batches) != 1 {
		t.Fatalf("batches = %d, want 1", len(batches))
	}

	jobs := repo.Jobs(run.ID)
	if len(jobs) != 1 {
		t.Fatalf("jobs = %d, want 1", len(jobs))
	}
	if jobs[0].JobKind != "seed_property_projection" {
		t.Errorf("job kind = %s, want seed_property_projection", jobs[0].JobKind)
	}
}
