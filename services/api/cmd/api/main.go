package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	apihttp "github.com/nyasha-hama/titlechain/services/api/internal/http"
	"github.com/nyasha-hama/titlechain/services/api/internal/jobs"
	"github.com/nyasha-hama/titlechain/services/api/internal/platform"
	"github.com/nyasha-hama/titlechain/services/api/internal/property"
	"github.com/nyasha-hama/titlechain/services/api/internal/store"
)

func main() {
	cfg := platform.LoadConfig()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	cancel()
	if err != nil {
		log.Fatalf("connect to database: %v", err)
	}
	defer pool.Close()

	casesStore := store.NewCasesStore(pool)
	casesService := cases.NewService(casesStore)

	propertiesStore := store.NewPropertiesStore(pool)
	propertiesService := property.NewService(propertiesStore)

	jobsStore := store.NewJobsStore(pool)
	jobsService := jobs.NewService(jobsStore)

	server := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: apihttp.NewRouter(apihttp.RouterDeps{Cases: casesService, Properties: propertiesService, Jobs: jobsService}),
	}

	log.Printf("api listening on %s", cfg.HTTPAddr)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}