package http

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
)

func TestPilotSignInSetsCookie(t *testing.T) {
	router := NewRouter(RouterDeps{Pilot: pilot.NewService(pilot.NewMemoryRepository())})

	req := httptest.NewRequest(http.MethodPost, "/api/pilot/auth/sign-in", strings.NewReader(`{"email":"demo@titlechain.co.za","password":"demo1234"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	if len(rec.Result().Cookies()) == 0 {
		t.Fatal("cookies = empty, want session cookie")
	}
}

func TestPilotMeRequiresSession(t *testing.T) {
	router := NewRouter(RouterDeps{Pilot: pilot.NewService(pilot.NewMemoryRepository())})

	req := httptest.NewRequest(http.MethodGet, "/api/pilot/me", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}

func TestPilotMetricsRoute(t *testing.T) {
	router := NewRouter(RouterDeps{Pilot: pilot.NewService(pilot.NewMemoryRepository())})

	req := httptest.NewRequest(http.MethodGet, "/api/internal/pilot/metrics", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
}
