package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
)

func TestOpsRunsHandler_PostSeedProjectionReturns201(t *testing.T) {
	repo := &stubJobsRepo{}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/runs/property-sync", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d: %s", http.StatusCreated, rec.Code, rec.Body.String())
	}

	var run jobs.RunSummary
	if err := json.Unmarshal(rec.Body.Bytes(), &run); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if run.RunType != jobs.RunTypeSeedPropertyProjection {
		t.Errorf("run_type = %s, want %s", run.RunType, jobs.RunTypeSeedPropertyProjection)
	}
	if run.Status != "pending" {
		t.Errorf("status = %s, want pending", run.Status)
	}
}

func TestOpsRunsHandler_PostSeedProjectionReturns409WhenActiveRun(t *testing.T) {
	repo := &stubJobsRepo{
		activeRun: &jobs.RunSummary{
			ID:      "run-active",
			RunType: jobs.RunTypeSeedPropertyProjection,
			Status:  "running",
		},
	}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/runs/property-sync", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected %d, got %d: %s", http.StatusConflict, rec.Code, rec.Body.String())
	}
}

func TestOpsRunsHandler_ListRunsReturns200(t *testing.T) {
	repo := &stubJobsRepo{
		runs: []jobs.RunSummary{
			{ID: "run-1", RunType: "seed_property_projection", Status: "completed", TotalJobs: 5, CompletedJobs: 5},
		},
	}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	req := httptest.NewRequest(http.MethodGet, "/api/internal/ops/runs", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d: %s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var runs []jobs.RunSummary
	if err := json.Unmarshal(rec.Body.Bytes(), &runs); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("runs = %d, want 1", len(runs))
	}
}