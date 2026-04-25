package http

import (
	"encoding/json"
	stdhttp "net/http"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
)

type pilotMattersHandler struct {
	service pilot.Service
}

func newPilotMattersHandler(service pilot.Service) pilotMattersHandler {
	return pilotMattersHandler{service: service}
}

func (h pilotMattersHandler) list(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	status := r.URL.Query().Get("status")
	matters, err := h.service.ListMatters(r.Context(), user, status)
	if err != nil {
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if matters == nil {
		matters = []pilot.MatterSummary{}
	}
	respondJSON(w, stdhttp.StatusOK, matters)
}

func (h pilotMattersHandler) create(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	var req pilot.CreateMatterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}
	if strings.TrimSpace(req.PropertyDescription) == "" {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "property_description is required"})
		return
	}
	if strings.TrimSpace(req.LocalityOrArea) == "" {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "locality_or_area is required"})
		return
	}
	if strings.TrimSpace(req.MunicipalityOrDeedsOffice) == "" {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "municipality_or_deeds_office is required"})
		return
	}
	matter, err := h.service.CreateMatter(r.Context(), user, req)
	if err != nil {
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusCreated, matter)
}

func (h pilotMattersHandler) get(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	matterID := chi.URLParam(r, "matterID")
	detail, err := h.service.GetMatterDetail(r.Context(), user, matterID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			respondJSON(w, stdhttp.StatusNotFound, map[string]string{"error": "matter not found"})
			return
		}
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, detail)
}

func (h pilotMattersHandler) reopen(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	matterID := chi.URLParam(r, "matterID")
	var req pilot.ReopenMatterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}
	if strings.TrimSpace(req.Note) == "" {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "note is required"})
		return
	}
	detail, err := h.service.ReopenMatter(r.Context(), user, matterID, req)
	if err != nil {
		if strings.Contains(err.Error(), "only resolved") {
			respondJSON(w, stdhttp.StatusConflict, map[string]string{"error": err.Error()})
			return
		}
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, detail)
}

func (h pilotMattersHandler) summary(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	user, ok := pilotCurrentUser(h.service, w, r)
	if !ok {
		return
	}
	matterID := chi.URLParam(r, "matterID")
	export, err := h.service.CreateSummaryExport(r.Context(), user, matterID)
	if err != nil {
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, export)
}
