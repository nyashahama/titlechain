package pilot

import "time"

type Organization struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Slug   string `json:"slug"`
	Status string `json:"status"`
}

type User struct {
	ID           string       `json:"id"`
	Organization Organization `json:"organization"`
	Email        string       `json:"email"`
	DisplayName  string       `json:"display_name"`
	Role         string       `json:"role"`
	Active       bool         `json:"active"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthSession struct {
	Token     string    `json:"-"`
	User      User      `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

type CreateMatterRequest struct {
	PropertyDescription       string `json:"property_description"`
	LocalityOrArea            string `json:"locality_or_area"`
	MunicipalityOrDeedsOffice string `json:"municipality_or_deeds_office"`
	TitleReference            string `json:"title_reference,omitempty"`
	CustomerReference         string `json:"customer_reference,omitempty"`
	IntakeNote                string `json:"intake_note,omitempty"`
}

type MatterSummary struct {
	ID                         string     `json:"id"`
	CaseID                     string     `json:"case_id"`
	CaseReference              string     `json:"case_reference"`
	CustomerReference          string     `json:"customer_reference,omitempty"`
	CustomerStatus             string     `json:"customer_status"`
	PropertyDescription        string     `json:"property_description"`
	LocalityOrArea             string     `json:"locality_or_area"`
	MunicipalityOrDeedsOffice  string     `json:"municipality_or_deeds_office"`
	TitleReference             string     `json:"title_reference,omitempty"`
	Decision                   string     `json:"decision,omitempty"`
	SubmittedAt                time.Time  `json:"submitted_at"`
	UpdatedAt                  time.Time  `json:"updated_at"`
	ResolvedAt                 *time.Time `json:"resolved_at,omitempty"`
}

type MatterDetail struct {
	Summary  MatterSummary          `json:"summary"`
	Evidence []VisibleEvidence      `json:"evidence"`
	Reasons  []VisibleReason        `json:"reasons"`
	Timeline []VisibleTimelineEvent `json:"timeline"`
}

type VisibleEvidence struct {
	Type            string `json:"type"`
	SourceType      string `json:"source_type"`
	SourceReference string `json:"source_reference"`
	Excerpt         string `json:"excerpt,omitempty"`
	Status          string `json:"status"`
}

type VisibleReason struct {
	Code  string `json:"code"`
	Label string `json:"label"`
}

type VisibleTimelineEvent struct {
	Type      string    `json:"type"`
	Label     string    `json:"label"`
	CreatedAt time.Time `json:"created_at"`
}

type ReopenMatterRequest struct {
	Note string `json:"note"`
}

type SummaryExport struct {
	Matter      MatterDetail `json:"matter"`
	GeneratedAt time.Time    `json:"generated_at"`
	Disclaimer  string       `json:"disclaimer"`
}

type Metrics struct {
	SubmittedCount          int `json:"submitted_count"`
	ResolvedCount           int `json:"resolved_count"`
	ReopenedCount           int `json:"reopened_count"`
	InReviewCount           int `json:"in_review_count"`
	UnresolvedCount         int `json:"unresolved_count"`
	AverageSecondsToResolve int `json:"average_seconds_to_resolve"`
	OldestInReviewSeconds   int `json:"oldest_in_review_seconds"`
	AcceptedProposalCount   int `json:"accepted_proposal_count"`
	ManualOverrideCount     int `json:"manual_override_count"`
}
