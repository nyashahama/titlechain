package pilot

import (
	"context"
	"errors"
	"strings"
	"time"
)

var ErrInvalidCredentials = errors.New("invalid email or password")
var ErrUnauthorized = errors.New("unauthorized")
var ErrForbidden = errors.New("forbidden")

type Service struct {
	repo Repository
	now  func() time.Time
}

func NewService(repo Repository) Service {
	return Service{repo: repo, now: time.Now}
}

func (s Service) SignIn(ctx context.Context, req SignInRequest) (AuthSession, error) {
	email := strings.TrimSpace(req.Email)
	if email == "" || strings.TrimSpace(req.Password) == "" {
		return AuthSession{}, ErrInvalidCredentials
	}
	record, err := s.repo.FindUserByEmail(ctx, email)
	if err != nil {
		return AuthSession{}, ErrInvalidCredentials
	}
	if !record.Active || record.Organization.Status != "active" {
		return AuthSession{}, ErrForbidden
	}
	if !verifyPassword(req.Password, record.PasswordHash) {
		return AuthSession{}, ErrInvalidCredentials
	}
	token, tokenHash, err := newSessionToken()
	if err != nil {
		return AuthSession{}, err
	}
	expiresAt := s.now().Add(24 * time.Hour)
	if err := s.repo.CreateSession(ctx, record.ID, tokenHash, expiresAt); err != nil {
		return AuthSession{}, err
	}
	return AuthSession{Token: token, User: record.User, ExpiresAt: expiresAt}, nil
}

func (s Service) CurrentUser(ctx context.Context, token string) (User, error) {
	if strings.TrimSpace(token) == "" {
		return User{}, ErrUnauthorized
	}
	record, err := s.repo.FindUserBySessionTokenHash(ctx, hashSessionToken(token))
	if err != nil {
		return User{}, ErrUnauthorized
	}
	if !record.Active {
		return User{}, ErrUnauthorized
	}
	if record.Organization.Status != "active" {
		return User{}, ErrForbidden
	}
	return record.User, nil
}

func (s Service) SignOut(ctx context.Context, token string) error {
	if strings.TrimSpace(token) == "" {
		return nil
	}
	return s.repo.RevokeSession(ctx, hashSessionToken(token))
}

func (s Service) CreateMatter(ctx context.Context, user User, req CreateMatterRequest) (MatterSummary, error) {
	if strings.TrimSpace(req.PropertyDescription) == "" {
		return MatterSummary{}, errors.New("property_description is required")
	}
	if strings.TrimSpace(req.LocalityOrArea) == "" {
		return MatterSummary{}, errors.New("locality_or_area is required")
	}
	if strings.TrimSpace(req.MunicipalityOrDeedsOffice) == "" {
		return MatterSummary{}, errors.New("municipality_or_deeds_office is required")
	}
	return s.repo.CreateMatter(ctx, user, req)
}

func (s Service) ListMatters(ctx context.Context, user User, status string) ([]MatterSummary, error) {
	return s.repo.ListMatters(ctx, user, status, 100)
}

func (s Service) GetMatterDetail(ctx context.Context, user User, matterID string) (MatterDetail, error) {
	return s.repo.GetMatterDetail(ctx, user, matterID)
}

func (s Service) ReopenMatter(ctx context.Context, user User, matterID string, req ReopenMatterRequest) (MatterDetail, error) {
	if strings.TrimSpace(req.Note) == "" {
		return MatterDetail{}, errors.New("note is required")
	}
	return s.repo.ReopenMatter(ctx, user, matterID, req)
}

func (s Service) CreateSummaryExport(ctx context.Context, user User, matterID string) (SummaryExport, error) {
	return s.repo.CreateSummaryExport(ctx, user, matterID)
}

func (s Service) GetMetrics(ctx context.Context) (Metrics, error) {
	return s.repo.GetMetrics(ctx)
}
