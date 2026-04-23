package http

import (
	"encoding/json"
	"strings"
	stdhttp "net/http"

	"github.com/go-chi/chi/v5"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
)

type casesHandler struct {
	service cases.Service
}

func newCasesHandler(service cases.Service) casesHandler {
	return casesHandler{service: service}
}

func (h casesHandler) listAnalysts(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	analysts, err := h.service.ListAnalysts(r.Context())
	if err != nil {
		h.respondError(w, stdhttp.StatusInternalServerError, err.Error())
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, analysts)
}

func (h casesHandler) listReasonCodes(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	codes, err := h.service.ListReasonCodes(r.Context())
	if err != nil {
		h.respondError(w, stdhttp.StatusInternalServerError, err.Error())
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, codes)
}

func (h casesHandler) listCases(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	filter := cases.ListCasesFilter{
		Status:     r.URL.Query().Get("status"),
		AssigneeID: r.URL.Query().Get("assignee_id"),
	}
	// Default limit
	filter.Limit = 100

	casesList, err := h.service.ListCases(r.Context(), filter)
	if err != nil {
		h.respondError(w, stdhttp.StatusInternalServerError, err.Error())
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, casesList)
}

func (h casesHandler) createCase(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	var req cases.CreateCaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.CreateCase(r.Context(), req)
	if err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		return
	}
	h.respondJSON(w, stdhttp.StatusCreated, detail)
}

func (h casesHandler) getCase(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	detail, err := h.service.GetCaseDetail(r.Context(), caseID)
	if err != nil {
		h.respondError(w, stdhttp.StatusNotFound, "case not found")
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) reassignCase(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.ReassignCaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.ReassignCase(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) confirmPropertyMatch(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.ConfirmPropertyMatchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.ConfirmPropertyMatch(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) addEvidence(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.AddEvidenceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.AddEvidence(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) addParty(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.AddPartyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.AddParty(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) recordDecision(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.RecordDecisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.RecordDecision(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) closeUnresolved(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.CloseUnresolvedRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.CloseUnresolved(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func (h casesHandler) reopenCase(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	caseID := chi.URLParam(r, "caseID")
	var req cases.ReopenCaseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, stdhttp.StatusBadRequest, "invalid request body")
		return
	}

	detail, err := h.service.ReopenCase(r.Context(), caseID, req)
	if err != nil {
		if isNotFound(err) {
			h.respondError(w, stdhttp.StatusNotFound, "case not found")
		} else {
			h.respondError(w, stdhttp.StatusBadRequest, err.Error())
		}
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, detail)
}

func isNotFound(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "not found") || strings.Contains(msg, "no rows")
}

func (h casesHandler) respondJSON(w stdhttp.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (h casesHandler) respondError(w stdhttp.ResponseWriter, status int, message string) {
	h.respondJSON(w, status, map[string]string{"error": message})
}
