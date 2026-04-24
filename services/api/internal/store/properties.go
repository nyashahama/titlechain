package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/nyasha-hama/titlechain/services/api/internal/property"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type PropertiesStore struct {
	pool *pgxpool.Pool
}

var _ property.Repository = PropertiesStore{}

func NewPropertiesStore(pool *pgxpool.Pool) PropertiesStore {
	return PropertiesStore{pool: pool}
}

func (s PropertiesStore) ListProperties(ctx context.Context, filter property.ListFilter) ([]property.PropertySummary, error) {
	queries := sqlc.New(s.pool)

	var query, locality, status pgtype.Text
	if filter.Query != "" {
		query = pgtype.Text{String: filter.Query, Valid: true}
	}
	if filter.Locality != "" {
		locality = pgtype.Text{String: filter.Locality, Valid: true}
	}
	if filter.Status != "" {
		status = pgtype.Text{String: filter.Status, Valid: true}
	}

	limit := int32(filter.Limit)
	if limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	rows, err := queries.ListPropertySummaries(ctx, sqlc.ListPropertySummariesParams{
		Query:    query,
		Locality: locality,
		Status:   status,
		Limit:    limit,
	})
	if err != nil {
		return nil, err
	}

	result := make([]property.PropertySummary, 0, len(rows))
	for _, row := range rows {
		result = append(result, propertySummaryFromRow(row))
	}
	return result, nil
}

func propertySummaryFromRow(row sqlc.ListPropertySummariesRow) property.PropertySummary {
	return property.PropertySummary{
		PropertyID:                uuidToString(row.PropertyID),
		PropertyDescription:       row.PropertyDescription,
		LocalityOrArea:            row.LocalityOrArea,
		MunicipalityOrDeedsOffice: row.MunicipalityOrDeedsOffice,
		TitleReference:            row.TitleReference,
		CurrentOwnerName:          textToString(row.CurrentOwnerName),
		Status:                    row.Status,
		UpdatedAt:                 row.UpdatedAt.Time,
	}
}