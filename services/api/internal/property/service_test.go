package property

import (
	"context"
	"testing"
)

type stubRepository struct {
	properties []PropertySummary
}

func (r *stubRepository) ListProperties(_ context.Context, _ ListFilter) ([]PropertySummary, error) {
	return r.properties, nil
}

func TestService_ListPropertiesFiltersAndLimits(t *testing.T) {
	repo := &stubRepository{
		properties: []PropertySummary{
			{PropertyID: "prop-1", PropertyDescription: "Erf 412 Rosebank Township", LocalityOrArea: "Rosebank", Status: "No material blocker seeded"},
			{PropertyID: "prop-2", PropertyDescription: "Section 8 SS Harbor View", LocalityOrArea: "Umhlanga", Status: "Ownership variance seeded"},
		},
	}
	svc := NewService(repo)

	rows, err := svc.ListProperties(context.Background(), ListFilter{
		Query:    "rosebank",
		Locality: "Rosebank",
		Limit:    10,
	})
	if err != nil {
		t.Fatalf("list properties: %v", err)
	}
	if len(rows) != 1 {
		t.Fatalf("rows = %d, want 1", len(rows))
	}
	if rows[0].PropertyID != "prop-1" {
		t.Fatalf("property_id = %s, want prop-1", rows[0].PropertyID)
	}
}

func TestService_ListPropertiesClampsLimit(t *testing.T) {
	repo := &stubRepository{
		properties: []PropertySummary{
			{PropertyID: "p1", PropertyDescription: "test", Status: "ok"},
		},
	}
	svc := NewService(repo)

	_, err := svc.ListProperties(context.Background(), ListFilter{Limit: 200})
	if err != nil {
		t.Fatalf("list properties: %v", err)
	}

	_, err = svc.ListProperties(context.Background(), ListFilter{Limit: 0})
	if err != nil {
		t.Fatalf("list properties: %v", err)
	}
}

func TestService_ListPropertiesStatusFilter(t *testing.T) {
	repo := &stubRepository{
		properties: []PropertySummary{
			{PropertyID: "prop-1", PropertyDescription: "Erf 412", Status: "active"},
			{PropertyID: "prop-2", PropertyDescription: "Erf 413", Status: "inactive"},
		},
	}
	svc := NewService(repo)

	rows, err := svc.ListProperties(context.Background(), ListFilter{
		Status: "active",
		Limit:  50,
	})
	if err != nil {
		t.Fatalf("list properties: %v", err)
	}
	if len(rows) != 1 {
		t.Fatalf("rows = %d, want 1", len(rows))
	}
	if rows[0].PropertyID != "prop-1" {
		t.Fatalf("property_id = %s, want prop-1", rows[0].PropertyID)
	}
}

