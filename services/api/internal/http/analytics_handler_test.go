package http

import (
	"context"
	"encoding/json"
	"errors"
	stdhttp "net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
)

func TestAnalyticsOverview_ReturnsRequestedRange(t *testing.T) {
	router := NewRouter(RouterDeps{Analytics: analytics.NewService(analytics.NewMemoryRepository())})

	req := httptest.NewRequest(stdhttp.MethodGet, "/api/internal/analytics/overview?range=7d", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != stdhttp.StatusOK {
		t.Fatalf("status = %d, want 200: %s", rec.Code, rec.Body.String())
	}

	var overview analytics.Overview
	if err := json.Unmarshal(rec.Body.Bytes(), &overview); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if overview.Range.Key != analytics.RangeSevenDays {
		t.Fatalf("range key = %q, want %q", overview.Range.Key, analytics.RangeSevenDays)
	}
}

func TestAnalyticsOverview_RejectsUnsupportedRange(t *testing.T) {
	router := NewRouter(RouterDeps{Analytics: analytics.NewService(analytics.NewMemoryRepository())})

	req := httptest.NewRequest(stdhttp.MethodGet, "/api/internal/analytics/overview?range=365d", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != stdhttp.StatusBadRequest {
		t.Fatalf("status = %d, want 400: %s", rec.Code, rec.Body.String())
	}

	var payload map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload["error"] == "" {
		t.Fatal("error = empty, want unsupported range message")
	}
}

func TestAnalyticsOverview_ReturnsInternalServerErrorForRepositoryError(t *testing.T) {
	repoErr := errors.New("unsupported analytics range repository unavailable")
	router := NewRouter(RouterDeps{Analytics: analytics.NewService(errorAnalyticsRepo{err: repoErr})})

	req := httptest.NewRequest(stdhttp.MethodGet, "/api/internal/analytics/overview?range=7d", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != stdhttp.StatusInternalServerError {
		t.Fatalf("status = %d, want 500: %s", rec.Code, rec.Body.String())
	}

	var payload map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload["error"] != repoErr.Error() {
		t.Fatalf("error = %q, want %q", payload["error"], repoErr.Error())
	}
}

type errorAnalyticsRepo struct {
	err error
}

func (r errorAnalyticsRepo) Overview(context.Context, analytics.Window) (analytics.Overview, error) {
	return analytics.Overview{}, r.err
}
