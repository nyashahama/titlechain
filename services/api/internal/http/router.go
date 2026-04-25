package http

import (
	stdhttp "net/http"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
)

type RouterDeps struct {
	Cases      cases.Service
	Properties property.Service
	Jobs       jobs.Service
}

func NewRouter(deps RouterDeps) stdhttp.Handler {
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
		propertiesHandler := newPropertiesHandler(deps.Properties)
		r.Route("/portal", func(r chi.Router) {
			r.Get("/properties", propertiesHandler.listProperties)
		})

		opsRunsHandler := newOpsRunsHandler(deps.Jobs)
		r.Route("/ops", func(r chi.Router) {
			r.Get("/runs", opsRunsHandler.listRuns)
			r.Post("/runs/property-sync", opsRunsHandler.startSeedProjection)
			r.Post("/source-batches", opsRunsHandler.startSourceIngestion)
		})

		casesHandler := newCasesHandler(deps.Cases)
		r.Get("/analysts", casesHandler.listAnalysts)
		r.Get("/reason-codes", casesHandler.listReasonCodes)
		r.Get("/cases", casesHandler.listCases)
		r.Post("/cases", casesHandler.createCase)
		r.Get("/cases/{caseID}", casesHandler.getCase)
		r.Post("/cases/{caseID}/assignment", casesHandler.reassignCase)
		r.Post("/cases/{caseID}/property-match", casesHandler.confirmPropertyMatch)
		r.Post("/cases/{caseID}/evidence", casesHandler.addEvidence)
		r.Post("/cases/{caseID}/parties", casesHandler.addParty)
		r.Post("/cases/{caseID}/decision", casesHandler.recordDecision)
		r.Post("/cases/{caseID}/close-unresolved", casesHandler.closeUnresolved)
		r.Post("/cases/{caseID}/reopen", casesHandler.reopenCase)
	})

	return r
}