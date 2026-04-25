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

func TestVerifyPasswordRejectsLegacyDevSHA(t *testing.T) {
	if verifyPassword("demo1234", "phase4-dev-sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d") {
		t.Fatal("legacy dev sha password hash verified, want rejection")
	}
}

func TestServiceCreateSummaryExportRejectsOtherOrganizationMatter(t *testing.T) {
	repo := NewMemoryRepository()
	svc := NewService(repo)

	firstSession, err := svc.SignIn(context.Background(), SignInRequest{Email: "demo@titlechain.co.za", Password: "demo1234"})
	if err != nil {
		t.Fatalf("sign in first org user: %v", err)
	}
	matter, err := svc.CreateMatter(context.Background(), firstSession.User, CreateMatterRequest{
		PropertyDescription:       "Erf 412 Rosebank Township",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Johannesburg",
	})
	if err != nil {
		t.Fatalf("create matter: %v", err)
	}

	otherUser := repo.AddUser("other@example.test", "demo1234", Organization{
		ID:     "00000000-0000-4000-8000-000000000002",
		Name:   "Other Conveyancers",
		Slug:   "other-conveyancers",
		Status: "active",
	})

	_, err = svc.CreateSummaryExport(context.Background(), otherUser, matter.ID)
	if err == nil {
		t.Fatal("cross-organization summary export err = nil, want error")
	}
}
