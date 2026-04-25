package pilot

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

type memoryRepository struct {
	mu            sync.RWMutex
	organizations map[string]Organization
	users         map[string]UserRecord
	sessions      map[string]sessionRecord
	matters       map[string]*memoryMatter
	metricRef     map[string]string
}

type sessionRecord struct {
	userID    string
	expiresAt time.Time
	revokedAt *time.Time
}

type memoryMatter struct {
	MatterSummary
	organizationID string
	evidence       []VisibleEvidence
	reasons        []VisibleReason
	timeline       []VisibleTimelineEvent
	reopened       bool
	summaryExports []SummaryExport
}

var _ Repository = &memoryRepository{}

func NewMemoryRepository() *memoryRepository {
	org := Organization{
		ID:     "00000000-0000-4000-8000-000000000001",
		Name:   "Hama & Associates Inc",
		Slug:   "hama-associates",
		Status: "active",
	}

	repo := &memoryRepository{
		organizations: map[string]Organization{org.ID: org},
		users:         make(map[string]UserRecord),
		sessions:      make(map[string]sessionRecord),
		matters:       make(map[string]*memoryMatter),
		metricRef:     make(map[string]string),
	}

	repo.users["demo@titlechain.co.za"] = UserRecord{
		User: User{
			ID:           "00000000-0000-4000-8000-000000000101",
			Organization: org,
			Email:        "demo@titlechain.co.za",
			DisplayName:  "Nyasha Hama",
			Role:         "pilot_admin",
			Active:       true,
		},
		PasswordHash: hashPasswordForDev("demo1234"),
	}

	return repo
}

func (r *memoryRepository) SuspendDemoOrganization() {
	r.mu.Lock()
	defer r.mu.Unlock()
	org := r.organizations["00000000-0000-4000-8000-000000000001"]
	org.Status = "suspended"
	r.organizations[org.ID] = org
}

func (r *memoryRepository) AddUser(email, password string, org Organization) User {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.organizations[org.ID] = org
	user := User{
		ID:           fmt.Sprintf("user-%d", len(r.users)+1),
		Organization: org,
		Email:        email,
		DisplayName:  email,
		Role:         "member",
		Active:       true,
	}
	r.users[email] = UserRecord{
		User:         user,
		PasswordHash: hashPasswordForDev(password),
	}
	return user
}

func (r *memoryRepository) FindUserByEmail(ctx context.Context, email string) (UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.users[email]
	if !ok {
		return UserRecord{}, errors.New("not found")
	}
	if org, ok := r.organizations[record.Organization.ID]; ok {
		record.Organization = org
	}
	return record, nil
}

func (r *memoryRepository) FindUserBySessionTokenHash(ctx context.Context, tokenHash string) (UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	session, ok := r.sessions[tokenHash]
	if !ok || session.revokedAt != nil || time.Now().After(session.expiresAt) {
		return UserRecord{}, errors.New("session not found or expired")
	}

	userID := session.userID
	for _, u := range r.users {
		if u.ID == userID {
			if org, ok := r.organizations[u.Organization.ID]; ok {
				u.Organization = org
			}
			return u, nil
		}
	}
	return UserRecord{}, errors.New("user not found")
}

func (r *memoryRepository) CreateSession(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.sessions[tokenHash] = sessionRecord{userID: userID, expiresAt: expiresAt}
	return nil
}

func (r *memoryRepository) RevokeSession(ctx context.Context, tokenHash string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if s, ok := r.sessions[tokenHash]; ok {
		now := time.Now()
		s.revokedAt = &now
		r.sessions[tokenHash] = s
	}
	return nil
}

func (r *memoryRepository) CreateMatter(ctx context.Context, user User, req CreateMatterRequest) (MatterSummary, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	id := fmt.Sprintf("matter-%d", len(r.matters)+1)
	caseID := fmt.Sprintf("case-%d", len(r.matters)+1)
	caseRef := fmt.Sprintf("TC-2026-%04d", len(r.matters)+1)
	now := time.Now()

	summary := MatterSummary{
		ID:                        id,
		CaseID:                    caseID,
		CaseReference:             caseRef,
		CustomerReference:         req.CustomerReference,
		CustomerStatus:            "submitted",
		PropertyDescription:       req.PropertyDescription,
		LocalityOrArea:            req.LocalityOrArea,
		MunicipalityOrDeedsOffice: req.MunicipalityOrDeedsOffice,
		TitleReference:            req.TitleReference,
		SubmittedAt:               now,
		UpdatedAt:                 now,
	}

	r.matters[id] = &memoryMatter{
		MatterSummary:  summary,
		organizationID: user.Organization.ID,
		evidence:       []VisibleEvidence{},
		reasons:        []VisibleReason{},
		timeline: []VisibleTimelineEvent{
			{Type: "submitted", Label: "Matter submitted", CreatedAt: now},
		},
	}
	r.metricRef[id] = caseID

	return summary, nil
}

func (r *memoryRepository) ListMatters(ctx context.Context, user User, status string, limit int) ([]MatterSummary, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var summaries []MatterSummary
	for _, m := range r.matters {
		if m.organizationID != user.Organization.ID {
			continue
		}
		if status == "" || m.CustomerStatus == status {
			summaries = append(summaries, m.MatterSummary)
		}
	}
	return summaries, nil
}

func (r *memoryRepository) GetMatterDetail(ctx context.Context, user User, matterID string) (MatterDetail, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	m, ok := r.matters[matterID]
	if !ok {
		return MatterDetail{}, errors.New("matter not found")
	}
	if m.organizationID != user.Organization.ID {
		return MatterDetail{}, errors.New("matter not found")
	}

	return MatterDetail{
		Summary:  m.MatterSummary,
		Evidence: m.evidence,
		Reasons:  m.reasons,
		Timeline: m.timeline,
	}, nil
}

func (r *memoryRepository) ReopenMatter(ctx context.Context, user User, matterID string, req ReopenMatterRequest) (MatterDetail, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	m, ok := r.matters[matterID]
	if !ok {
		return MatterDetail{}, errors.New("matter not found")
	}
	if m.organizationID != user.Organization.ID {
		return MatterDetail{}, errors.New("matter not found")
	}

	if m.CustomerStatus != "resolved" {
		return MatterDetail{}, errors.New("only resolved matters can be reopened")
	}

	m.CustomerStatus = "reopened"
	m.UpdatedAt = time.Now()
	m.timeline = append(m.timeline, VisibleTimelineEvent{
		Type:      "reopened",
		Label:     "Matter reopened by customer",
		CreatedAt: time.Now(),
	})

	return MatterDetail{
		Summary:  m.MatterSummary,
		Evidence: m.evidence,
		Reasons:  m.reasons,
		Timeline: m.timeline,
	}, nil
}

func (r *memoryRepository) CreateSummaryExport(ctx context.Context, user User, matterID string) (SummaryExport, error) {
	detail, err := r.GetMatterDetail(ctx, user, matterID)
	if err != nil {
		return SummaryExport{}, err
	}

	return SummaryExport{
		Matter:      detail,
		GeneratedAt: time.Now(),
		Disclaimer:  "TitleChain provides verification support, not legal advice or a deeds-office guarantee.",
	}, nil
}

func (r *memoryRepository) GetMetrics(ctx context.Context) (Metrics, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var m Metrics
	m.SubmittedCount = len(r.matters)
	for _, matter := range r.matters {
		switch matter.CustomerStatus {
		case "resolved":
			m.ResolvedCount++
		case "reopened":
			m.ReopenedCount++
		case "in_review":
			m.InReviewCount++
		}
	}
	return m, nil
}
