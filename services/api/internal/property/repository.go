package property

import "context"

type Repository interface {
	ListProperties(ctx context.Context, filter ListFilter) ([]PropertySummary, error)
}