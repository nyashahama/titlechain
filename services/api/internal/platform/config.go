package platform

import "os"

type Config struct {
	HTTPAddr    string
	DatabaseURL string
}

func LoadConfig() Config {
	addr := os.Getenv("API_HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://titlechain:titlechain@localhost:5432/titlechain?sslmode=disable"
	}

	return Config{
		HTTPAddr:    addr,
		DatabaseURL: dbURL,
	}
}
