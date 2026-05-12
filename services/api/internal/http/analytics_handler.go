package http

import (
	stdhttp "net/http"

	"github.com/nyasha-hama/titlechain/services/api/internal/analytics"
)

type analyticsHandler struct {
	service analytics.Service
}

func newAnalyticsHandler(service analytics.Service) analyticsHandler {
	return analyticsHandler{service: service}
}

func (h analyticsHandler) getOverview(w stdhttp.ResponseWriter, r *stdhttp.Request) {
	rangeKey := r.URL.Query().Get("range")
	if !isSupportedAnalyticsRange(rangeKey) {
		respondJSON(w, stdhttp.StatusBadRequest, map[string]string{"error": "unsupported analytics range"})
		return
	}

	overview, err := h.service.GetOverview(r.Context(), rangeKey)
	if err != nil {
		respondJSON(w, stdhttp.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, stdhttp.StatusOK, overview)
}

func isSupportedAnalyticsRange(rangeKey string) bool {
	switch rangeKey {
	case "", analytics.RangeSevenDays, analytics.RangeThirtyDays, analytics.RangeNinetyDays, analytics.RangeAll:
		return true
	default:
		return false
	}
}
