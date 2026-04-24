package http

import (
	"encoding/json"
	"errors"
	stdhttp "net/http"

	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
)

type opsRunsHandler struct {
	service jobs.Service
}

func newOpsRunsHandler(service jobs.Service) opsRunsHandler {
	return opsRunsHandler{service: service}
}

func (h opsRunsHandler) listRuns(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	runs, err := h.service.ListRuns(r.Context())
	if err != nil {
		h.respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, runs)
}

func (h opsRunsHandler) startSeedProjection(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	run, err := h.service.StartSeedPropertyProjection(r.Context())
	if err != nil {
		if err == jobs.ErrActiveRun {
			h.respondJSON(w, stdhttp.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		h.respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	h.respondJSON(w, stdhttp.StatusCreated, run)
}

func (h opsRunsHandler) startSourceIngestion(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	var req jobs.StartSourceIngestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}

	run, err := h.service.StartSourceIngestion(r.Context(), req)
	if err != nil {
		if errors.Is(err, jobs.ErrValidation) {
			h.respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		if err == jobs.ErrActiveRun {
			h.respondJSON(w, stdhttp.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		h.respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	h.respondJSON(w, stdhttp.StatusCreated, run)
}

func (h opsRunsHandler) respondJSON(w stdhttp.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}