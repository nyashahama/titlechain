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
