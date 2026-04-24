package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

func newTestRouter() http.Handler {
	propRepo := &stubPropertyRepo{
		properties: []property.PropertySummary{
			{PropertyID: "prop-1", PropertyDescription: "Erf 412 Rosebank Township", LocalityOrArea: "Rosebank", Status: "No material blocker seeded"},
		},
	}
	jobsRepo := &stubJobsRepo{
		runs: []jobs.RunSummary{
			{ID: "run-1", RunType: "seed_property_projection", Status: "completed"},
		},
	}
	return NewRouter(RouterDeps{
		Cases:      cases.NewService(nil),
		Properties: property.NewService(propRepo),
		Jobs:       jobs.NewService(jobsRepo),
	})
}

type stubPropertyRepo struct {
	properties []property.PropertySummary
}

func (r *stubPropertyRepo) ListProperties(_ context.Context, _ property.ListFilter) ([]property.PropertySummary, error) {
	return r.properties, nil
}

type stubJobsRepo struct {
	runs      []jobs.RunSummary
	activeRun *jobs.RunSummary
}

func (r *stubJobsRepo) ListRunsWithCounts(_ context.Context, _ int32) ([]jobs.RunSummary, error) {
	return r.runs, nil
}

func (r *stubJobsRepo) FindActiveRun(_ context.Context, _ string) (*jobs.RunSummary, error) {
	return r.activeRun, nil
}

func (r *stubJobsRepo) CreateSeedProjectionRun(_ context.Context) (jobs.RunSummary, error) {
	return jobs.RunSummary{
		ID:      "run-new",
		RunType: jobs.RunTypeSeedPropertyProjection,
		Status:  "pending",
	}, nil
}

func (r *stubJobsRepo) CreateSourceIngestionRun(_ context.Context, _ jobs.StartSourceIngestionRequest) (jobs.RunSummary, error) {
	return jobs.RunSummary{}, nil
}

func TestRouter_HealthAndInternalRoutes(t *testing.T) {
	router := newTestRouter()

	tests := []struct {
		name   string
		path   string
		status int
	}{
		{name: "healthz", path: "/healthz", status: http.StatusOK},
		{name: "readyz", path: "/readyz", status: http.StatusOK},
		{name: "portal search", path: "/api/internal/portal/properties", status: http.StatusOK},
		{name: "ops runs", path: "/api/internal/ops/runs", status: http.StatusOK},
	}

	for _, tc := range tests {
		req := httptest.NewRequest(http.MethodGet, tc.path, nil)
		rec := httptest.NewRecorder()

		router.ServeHTTP(rec, req)

		if rec.Code != tc.status {
			t.Fatalf("%s: expected %d, got %d", tc.name, tc.status, rec.Code)
		}
	}
}