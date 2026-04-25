package pilot

import (
	"context"
	"time"
)

type UserRecord struct {
	User
	PasswordHash string
}

type Repository interface {
	FindUserByEmail(ctx context.Context, email string) (UserRecord, error)
	FindUserBySessionTokenHash(ctx context.Context, tokenHash string) (UserRecord, error)
	CreateSession(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error
	RevokeSession(ctx context.Context, tokenHash string) error
	CreateMatter(ctx context.Context, user User, req CreateMatterRequest) (MatterSummary, error)
	ListMatters(ctx context.Context, user User, status string, limit int) ([]MatterSummary, error)
	GetMatterDetail(ctx context.Context, user User, matterID string) (MatterDetail, error)
	ReopenMatter(ctx context.Context, user User, matterID string, req ReopenMatterRequest) (MatterDetail, error)
	CreateSummaryExport(ctx context.Context, user User, matterID string) (SummaryExport, error)
	GetMetrics(ctx context.Context) (Metrics, error)
}
