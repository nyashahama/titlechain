package pilot

import (
	"context"
	"testing"
)

func TestMemoryRepositoryFindUserByEmail(t *testing.T) {
	repo := NewMemoryRepository()

	record, err := repo.FindUserByEmail(context.Background(), "demo@titlechain.co.za")
	if err != nil {
		t.Fatalf("find user: %v", err)
	}
	if record.Email != "demo@titlechain.co.za" {
		t.Fatalf("email = %s, want demo@titlechain.co.za", record.Email)
	}
	if !record.Active {
		t.Fatal("active = false, want true")
	}
}

func TestMemoryRepositoryFindUserByEmailNotFound(t *testing.T) {
	repo := NewMemoryRepository()

	_, err := repo.FindUserByEmail(context.Background(), "nonexistent@example.com")
	if err == nil {
		t.Fatal("err = nil, want not found")
	}
}

func TestMemoryRepositoryGetMatterDetailIncludesNeutralEvidenceReadiness(t *testing.T) {
	repo := NewMemoryRepository()
	user := repo.AddUser("pilot@example.com", "password", Organization{
		ID:     "org-1",
		Name:   "Org 1",
		Slug:   "org-1",
		Status: "active",
	})
	summary, err := repo.CreateMatter(context.Background(), user, CreateMatterRequest{
		PropertyDescription:       "Erf 1",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	if err != nil {
		t.Fatalf("create matter: %v", err)
	}

	detail, err := repo.GetMatterDetail(context.Background(), user, summary.ID)
	if err != nil {
		t.Fatalf("get matter detail: %v", err)
	}

	if detail.EvidenceReadiness.State == "" {
		t.Fatal("readiness state is empty")
	}
	if detail.EvidenceReadiness.Label == "" {
		t.Fatal("readiness label is empty")
	}
	if detail.EvidenceReadiness.Description == "" {
		t.Fatal("readiness description is empty")
	}
	if detail.EvidenceReadiness.Missing == nil {
		t.Fatal("readiness missing = nil, want empty slice")
	}
}
