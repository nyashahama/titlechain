package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
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

func TestOpsRunsHandler_StartSourceIngestion(t *testing.T) {
	repo := &stubJobsRepo{}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	body := strings.NewReader(`{"source_name":"pilot.deeds_snapshot","batch_key":"2026-04-25-main","payload_uri":"s3://titlechain/dev/2026-04-25-main.jsonl","payload_sha256":"abc123"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/source-batches", body)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusCreated)
	}

	var run jobs.RunSummary
	if err := json.Unmarshal(rec.Body.Bytes(), &run); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if run.RunType != jobs.RunTypeSourceIngestionV1 {
		t.Errorf("run_type = %s, want %s", run.RunType, jobs.RunTypeSourceIngestionV1)
	}
	if run.Status != "pending" {
		t.Errorf("status = %s, want pending", run.Status)
	}
	if repo.lastSourceIngestionReq == nil {
		t.Fatal("expected request to reach repository, got nil")
	}
	if repo.lastSourceIngestionReq.SourceName != "pilot.deeds_snapshot" {
		t.Errorf("source_name = %s, want pilot.deeds_snapshot", repo.lastSourceIngestionReq.SourceName)
	}
	if repo.lastSourceIngestionReq.BatchKey != "2026-04-25-main" {
		t.Errorf("batch_key = %s, want 2026-04-25-main", repo.lastSourceIngestionReq.BatchKey)
	}
}

func TestOpsRunsHandler_StartSourceIngestionReturns400ForInvalidJSON(t *testing.T) {
	repo := &stubJobsRepo{}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	body := strings.NewReader(`{invalid json`)
	req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/source-batches", body)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestOpsRunsHandler_StartSourceIngestionReturns400ForMissingFields(t *testing.T) {
	tests := []struct {
		name string
		body string
	}{
		{"empty source_name", `{"source_name":"","batch_key":"2026-04-25-main"}`},
		{"missing source_name", `{"batch_key":"2026-04-25-main"}`},
		{"empty batch_key", `{"source_name":"pilot.deeds_snapshot","batch_key":""}`},
		{"missing batch_key", `{"source_name":"pilot.deeds_snapshot"}`},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &stubJobsRepo{}
			svc := jobs.NewService(repo)
			router := NewRouter(RouterDeps{Jobs: svc})

			req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/source-batches", strings.NewReader(tt.body))
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
			}
		})
	}
}

func TestOpsRunsHandler_StartSourceIngestionReturns409WhenActiveRun(t *testing.T) {
	repo := &stubJobsRepo{
		activeRun: &jobs.RunSummary{
			ID:      "run-active",
			RunType: jobs.RunTypeSourceIngestionV1,
			Status:  "running",
		},
	}
	svc := jobs.NewService(repo)
	router := NewRouter(RouterDeps{Jobs: svc})

	body := strings.NewReader(`{"source_name":"pilot.deeds_snapshot","batch_key":"2026-04-25-main"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/internal/ops/source-batches", body)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusConflict)
	}
}
