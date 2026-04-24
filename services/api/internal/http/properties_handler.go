package http

import (
	"encoding/json"
	stdhttp "net/http"
	"strconv"

	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

type propertiesHandler struct {
	service property.Service
}

func newPropertiesHandler(service property.Service) propertiesHandler {
	return propertiesHandler{service: service}
}

func (h propertiesHandler) listProperties(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	limit := 50
	if v := r.URL.Query().Get("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			limit = n
		}
	}

	rows, err := h.service.ListProperties(r.Context(), property.ListFilter{
		Query:    r.URL.Query().Get("q"),
		Locality: r.URL.Query().Get("locality"),
		Status:   r.URL.Query().Get("status"),
		Limit:    limit,
	})
	if err != nil {
		h.respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	h.respondJSON(w, stdhttp.StatusOK, rows)
}

func (h propertiesHandler) respondJSON(w stdhttp.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}