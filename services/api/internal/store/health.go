package store

import "context"

type HealthStore interface {
	Ping(ctx context.Context) error
}
