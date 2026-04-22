package http

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRouter_HealthAndInternalRoutes(t *testing.T) {
	router := NewRouter()

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
