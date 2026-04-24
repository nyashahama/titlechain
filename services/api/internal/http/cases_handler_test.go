package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

func TestCasesHandler_CreateCaseReturnsCreatedDetail(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc})

	reqBody, _ := json.Marshal(cases.CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})

	req := httptest.NewRequest(http.MethodPost, "/api/internal/cases", bytes.NewReader(reqBody))
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d: %s", http.StatusCreated, rec.Code, rec.Body.String())
	}

	var detail cases.CaseDetail
	if err := json.Unmarshal(rec.Body.Bytes(), &detail); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if detail.Case.PropertyDescription != "Erf 412 Rosebank Township" {
		t.Errorf("property_description = %s", detail.Case.PropertyDescription)
	}
}

func TestCasesHandler_RecordDecisionRejectsInvalidStop(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc})

	// Create a case first
	createReqBody, _ := json.Marshal(cases.CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/internal/cases", bytes.NewReader(createReqBody))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	var detail cases.CaseDetail
	_ = json.Unmarshal(rec.Body.Bytes(), &detail)

	// Try to record invalid stop
	decReqBody, _ := json.Marshal(cases.RecordDecisionRequest{
		ActorID:     "ana-001",
		Decision:    cases.DecisionStop,
		ReasonCodes: []string{"OWNERSHIP_CONFLICT"},
		Note:        "No hard block.",
	})
	req = httptest.NewRequest(http.MethodPost, "/api/internal/cases/"+detail.Case.ID+"/decision", bytes.NewReader(decReqBody))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected %d, got %d: %s", http.StatusBadRequest, rec.Code, rec.Body.String())
	}
}

func TestCasesHandler_CloseUnresolvedReturnsDetail(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc})

	// Create a case
	createReqBody, _ := json.Marshal(cases.CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Farm Portion 17 Rietfontein",
		LocalityOrArea:            "Rietfontein",
		MunicipalityOrDeedsOffice: "Pretoria",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/internal/cases", bytes.NewReader(createReqBody))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	var detail cases.CaseDetail
	_ = json.Unmarshal(rec.Body.Bytes(), &detail)

	// Close unresolved
	closeReqBody, _ := json.Marshal(cases.CloseUnresolvedRequest{
		ActorID:     "ana-001",
		ReasonCodes: []string{"MISSING_TITLE_REFERENCE"},
		Note:        "Cannot verify title reference.",
	})
	req = httptest.NewRequest(http.MethodPost, "/api/internal/cases/"+detail.Case.ID+"/close-unresolved", bytes.NewReader(closeReqBody))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d: %s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var closed cases.CaseDetail
	if err := json.Unmarshal(rec.Body.Bytes(), &closed); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if closed.Case.Status != cases.CaseStatusClosedUnresolved {
		t.Errorf("status = %s, want closed_unresolved", closed.Case.Status)
	}
}

func TestCasesHandler_ListReasonCodes(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc})

	req := httptest.NewRequest(http.MethodGet, "/api/internal/reason-codes", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d: %s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var codes []cases.ReasonCode
	if err := json.Unmarshal(rec.Body.Bytes(), &codes); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(codes) == 0 {
		t.Error("expected reason codes, got none")
	}
}

func TestCasesHandler_CreateCaseWithSeedPropertyID(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc, Properties: property.NewService(&stubPropertyRepo{}), Jobs: jobs.NewService(&stubJobsRepo{})})

	reqBody, _ := json.Marshal(map[string]string{
		"actor_id":                   "ana-001",
		"property_description":        "Erf 412 Rosebank Township",
		"locality_or_area":            "Rosebank",
		"municipality_or_deeds_office": "Johannesburg",
		"seed_property_id":           "seed-prop-1",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/internal/cases", bytes.NewReader(reqBody))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected %d, got %d: %s", http.StatusCreated, rec.Code, rec.Body.String())
	}
}

func TestCasesHandler_ReassignCase(t *testing.T) {
	repo := cases.NewMemoryRepository()
	svc := cases.NewService(repo)
	router := NewRouter(RouterDeps{Cases: svc})

	// Create a case
	createReqBody, _ := json.Marshal(cases.CreateCaseRequest{
		ActorID:                   "ana-001",
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/internal/cases", bytes.NewReader(createReqBody))
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	var detail cases.CaseDetail
	_ = json.Unmarshal(rec.Body.Bytes(), &detail)

	// Reassign
	reassignReqBody, _ := json.Marshal(cases.ReassignCaseRequest{
		ActorID:    "ana-001",
		AssigneeID: "ana-002",
		Note:       "Reassigning.",
	})
	req = httptest.NewRequest(http.MethodPost, "/api/internal/cases/"+detail.Case.ID+"/assignment", bytes.NewReader(reassignReqBody))
	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d: %s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var reassigned cases.CaseDetail
	if err := json.Unmarshal(rec.Body.Bytes(), &reassigned); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if reassigned.Case.AssigneeID != "ana-002" {
		t.Errorf("assignee_id = %s, want ana-002", reassigned.Case.AssigneeID)
	}
}
