package http

import (
	stdhttp "net/http"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
)

type pilotMetricsHandler struct {
	service pilot.Service
}

func newPilotMetricsHandler(service pilot.Service) pilotMetricsHandler {
	return pilotMetricsHandler{service: service}
}

func (h pilotMetricsHandler) get(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	metrics, err := h.service.GetMetrics(r.Context())
	if err != nil {
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, metrics)
}
