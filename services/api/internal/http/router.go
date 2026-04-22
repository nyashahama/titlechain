package http

import (
	"encoding/json"
	stdhttp "net/http"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

func NewRouter() stdhttp.Handler {
	r := chi.NewRouter()

	r.Get("/healthz", func(w stdhttp.ResponseWriter, _ *stdhttp.Request) {
		w.WriteHeader(stdhttp.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Get("/readyz", func(w stdhttp.ResponseWriter, _ *stdhttp.Request) {
		w.WriteHeader(stdhttp.StatusOK)
		_, _ = w.Write([]byte("ready"))
	})

	r.Handle("/metrics", promhttp.Handler())

	r.Route("/api/internal", func(r chi.Router) {
		r.Route("/portal", func(r chi.Router) {
			r.Get("/properties", func(w stdhttp.ResponseWriter, _ *stdhttp.Request) {
				_ = json.NewEncoder(w).Encode(property.ListProperties())
			})
		})

		r.Route("/ops", func(r chi.Router) {
			r.Get("/runs", func(w stdhttp.ResponseWriter, _ *stdhttp.Request) {
				_ = json.NewEncoder(w).Encode(jobs.ListRuns())
			})
		})
	})

	return r
}
