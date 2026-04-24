// Package jobs provides the operations jobs domain. This file contains an in-memory
// repository implementation intended for testing only. Do not use in production.
package jobs

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type MemoryRepository struct {
	mu              sync.RWMutex
	runs            []RunSummary
	activeRun       *RunSummary
	runCounter      int
	batchCounter    int
	jobCounter      int
	batches         map[string]memoryBatch
	runJobs         map[string][]memoryJob
}

type memoryBatch struct {
	ID             string
	SourceName     string
	SourceBatchKey string
	PayloadURI     string
	PayloadSHA256  string
}

type memoryJob struct {
	ID      string
	RunID   string
	JobKind string
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		batches: make(map[string]memoryBatch),
		runJobs: make(map[string][]memoryJob),
	}
}

func (r *MemoryRepository) ListRunsWithCounts(_ context.Context, limit int32) ([]RunSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if limit > 0 && int(limit) < len(r.runs) {
		return append([]RunSummary{}, r.runs[:limit]...), nil
	}
	return append([]RunSummary{}, r.runs...), nil
}

func (r *MemoryRepository) FindActiveRun(_ context.Context, runType string) (*RunSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.activeRun != nil && r.activeRun.RunType == runType {
		return r.activeRun, nil
	}
	return nil, nil
}

func (r *MemoryRepository) CreateSeedProjectionRun(_ context.Context) (RunSummary, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	batch := memoryBatch{
		SourceName:     "ops.seed_properties",
		SourceBatchKey: fmt.Sprintf("seed-property-projection-%d", r.batchCounter+1),
	}
	return r.createRunLocked(RunTypeSeedPropertyProjection, batch, []string{"seed_property_projection"}), nil
}

func (r *MemoryRepository) CreateSourceIngestionRun(_ context.Context, req StartSourceIngestionRequest) (RunSummary, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	batch := memoryBatch{
		SourceName:     req.SourceName,
		SourceBatchKey: req.BatchKey,
		PayloadURI:     req.PayloadURI,
		PayloadSHA256:  req.PayloadSHA256,
	}
	return r.createRunLocked(RunTypeSourceIngestionV1, batch, IngestionJobKinds), nil
}

func (r *MemoryRepository) createRunLocked(runType string, batch memoryBatch, jobKinds []string) RunSummary {
	r.batchCounter++
	batchID := fmt.Sprintf("batch-%d", r.batchCounter)
	batch.ID = batchID
	r.batches[batchID] = batch

	r.runCounter++
	runID := fmt.Sprintf("run-%d", r.runCounter)
	now := time.Now().UTC()
	run := RunSummary{
		ID:        runID,
		RunType:   runType,
		Status:    "pending",
		CreatedAt: now,
	}
	r.runs = append(r.runs, run)
	r.activeRun = &run

	for _, kind := range jobKinds {
		r.jobCounter++
		jobID := fmt.Sprintf("job-%d", r.jobCounter)
		r.runJobs[runID] = append(r.runJobs[runID], memoryJob{
			ID:      jobID,
			RunID:   runID,
			JobKind: kind,
		})
	}

	return run
}

// Batches returns a copy of all created batches for test inspection.
func (r *MemoryRepository) Batches() map[string]memoryBatch {
	r.mu.RLock()
	defer r.mu.RUnlock()
	cp := make(map[string]memoryBatch, len(r.batches))
	for k, v := range r.batches {
		cp[k] = v
	}
	return cp
}

// Jobs returns a copy of all jobs associated with a run for test inspection.
func (r *MemoryRepository) Jobs(runID string) []memoryJob {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return append([]memoryJob{}, r.runJobs[runID]...)
}
