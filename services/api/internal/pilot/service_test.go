package pilot

import (
	"context"
	"testing"
)

func TestServiceSignInRejectsInvalidPassword(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)

	_, err := svc.SignIn(context.Background(), SignInRequest{
		Email:    "demo@titlechain.co.za",
		Password: "wrong",
	})
	if err == nil {
		t.Fatal("err = nil, want invalid credentials")
	}
}

func TestServiceSignInCreatesSession(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)

	session, err := svc.SignIn(context.Background(), SignInRequest{
		Email:    "demo@titlechain.co.za",
		Password: "demo1234",
	})
	if err != nil {
		t.Fatalf("sign in: %v", err)
	}
	if session.Token == "" {
		t.Fatal("token = empty")
	}
	if session.User.Organization.Name == "" {
		t.Fatal("organization name = empty")
	}
}

func TestServiceCurrentUserRejectsSuspendedOrganization(t *testing.T) {
	repo := NewMemoryRepository()
	repo.SuspendDemoOrganization()
	svc := NewService(repo)

	session, err := svc.SignIn(context.Background(), SignInRequest{
		Email:    "demo@titlechain.co.za",
		Password: "demo1234",
	})
	if err == nil {
		t.Fatalf("sign in err = %v, token = %q; want suspended org rejection", err, session.Token)
	}
}

func TestServiceCreateMatterCreatesScopedMatter(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)
	session, err := svc.SignIn(context.Background(), SignInRequest{Email: "demo@titlechain.co.za", Password: "demo1234"})
	if err != nil {
		t.Fatalf("sign in: %v", err)
	}

	matter, err := svc.CreateMatter(context.Background(), session.User, CreateMatterRequest{
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
		TitleReference:            "T12345/2024",
		CustomerReference:         "MAT-001",
	})
	if err != nil {
		t.Fatalf("create matter: %v", err)
	}
	if matter.CustomerStatus != "submitted" {
		t.Fatalf("customer_status = %s, want submitted", matter.CustomerStatus)
	}
	if matter.CaseID == "" {
		t.Fatal("case_id = empty")
	}
}
