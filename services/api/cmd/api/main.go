package main

import (
	"log"
	"net/http"

	apihttp "github.com/nyasha-hama/titlechain/services/api/internal/http"
	"github.com/nyasha-hama/titlechain/services/api/internal/platform"
)

func main() {
	cfg := platform.LoadConfig()

	server := &http.Server{
		Addr:    cfg.HTTPAddr,
		Handler: apihttp.NewRouter(),
	}

	log.Printf("api listening on %s", cfg.HTTPAddr)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
