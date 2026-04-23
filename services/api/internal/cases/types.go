package cases

import "time"

type CaseStatus string

const (
	CaseStatusOpen             CaseStatus = "open"
	CaseStatusInReview         CaseStatus = "in_review"
	CaseStatusResolved         CaseStatus = "resolved"
	CaseStatusClosedUnresolved CaseStatus = "closed_unresolved"
	CaseStatusReopened         CaseStatus = "reopened"
)

type DecisionOutcome string

const (
	DecisionClear  DecisionOutcome = "clear"
	DecisionReview DecisionOutcome = "review"
	DecisionStop   DecisionOutcome = "stop"
)

type ReasonCategory string

const (
	ReasonCategoryClearSupport          ReasonCategory = "clear_support"
	ReasonCategoryHardBlock             ReasonCategory = "hard_block"
	ReasonCategoryReviewTrigger         ReasonCategory = "review_trigger"
	ReasonCategoryUnresolvedInformation ReasonCategory = "unresolved_information"
)

type EvidenceStatus string

const (
	EvidenceStatusCaptured    EvidenceStatus = "captured"
	EvidenceStatusConfirmed   EvidenceStatus = "confirmed"
	EvidenceStatusConflicting EvidenceStatus = "conflicting"
	EvidenceStatusSuperseded  EvidenceStatus = "superseded"
)

type Analyst struct {
	ID          string    `json:"id"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
}

type ReasonCode struct {
	Code        string         `json:"code"`
	Label       string         `json:"label"`
	Category    ReasonCategory `json:"category"`
	IsHardBlock bool           `json:"is_hard_block"`
	Active      bool           `json:"active"`
	SortOrder   int32          `json:"sort_order"`
}

type CaseSummary struct {
	ID                        string     `json:"id"`
	CaseReference             string     `json:"case_reference"`
	PropertyDescription       string     `json:"property_description"`
	LocalityOrArea            string     `json:"locality_or_area"`
	MunicipalityOrDeedsOffice string     `json:"municipality_or_deeds_office"`
	TitleReference            string     `json:"title_reference,omitempty"`
	MatterReference           string     `json:"matter_reference,omitempty"`
	Status                    CaseStatus `json:"status"`
	AssigneeID                string     `json:"assignee_id"`
	CreatedBy                 string     `json:"created_by"`
	LinkedSeedPropertyID      string     `json:"linked_seed_property_id,omitempty"`
	CreatedAt                 time.Time  `json:"created_at"`
	UpdatedAt                 time.Time  `json:"updated_at"`
}

type CreateCaseRequest struct {
	ActorID                   string `json:"actor_id"`
	PropertyDescription       string `json:"property_description"`
	LocalityOrArea            string `json:"locality_or_area"`
	MunicipalityOrDeedsOffice string `json:"municipality_or_deeds_office"`
	TitleReference            string `json:"title_reference"`
	MatterReference           string `json:"matter_reference"`
	IntakeNote                string `json:"intake_note"`
}

type RecordDecisionRequest struct {
	ActorID     string          `json:"actor_id"`
	Decision    DecisionOutcome `json:"decision"`
	ReasonCodes []string        `json:"reason_codes"`
	Note        string          `json:"note"`
}

type ListCasesFilter struct {
	Status     string
	AssigneeID string
	Limit      int32
}

type SeedProperty struct {
	ID                        string         `json:"id"`
	PropertyDescription       string         `json:"property_description"`
	LocalityOrArea            string         `json:"locality_or_area"`
	MunicipalityOrDeedsOffice string         `json:"municipality_or_deeds_office"`
	TitleReference            string         `json:"title_reference,omitempty"`
	CurrentOwnerName          string         `json:"current_owner_name,omitempty"`
	StatusSummary             string         `json:"status_summary"`
	SeededRisk                map[string]any `json:"seeded_risk"`
}

type PropertyMatch struct {
	ID             string    `json:"id"`
	CaseID         string    `json:"case_id"`
	SeedPropertyID string    `json:"seed_property_id"`
	MatchSource    string    `json:"match_source"`
	Confidence     float64   `json:"confidence"`
	Status         string    `json:"status"`
	ConfirmedBy    string    `json:"confirmed_by,omitempty"`
	ConfirmedAt    time.Time `json:"confirmed_at,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type ConfirmPropertyMatchRequest struct {
	ActorID string `json:"actor_id"`
	MatchID string `json:"match_id"`
	Action  string `json:"action"`
}

type EvidenceItem struct {
	ID                string         `json:"id"`
	CaseID            string         `json:"case_id"`
	EvidenceType      string         `json:"evidence_type"`
	SourceType        string         `json:"source_type"`
	SourceReference   string         `json:"source_reference"`
	ExternalReference string         `json:"external_reference,omitempty"`
	Excerpt           string         `json:"excerpt,omitempty"`
	ExtractedFacts    map[string]any `json:"extracted_facts"`
	EvidenceStatus    EvidenceStatus `json:"evidence_status"`
	AnalystNote       string         `json:"analyst_note,omitempty"`
	CreatedBy         string         `json:"created_by"`
	CreatedAt         time.Time      `json:"created_at"`
}

type AddEvidenceRequest struct {
	ActorID           string         `json:"actor_id"`
	EvidenceType      string         `json:"evidence_type"`
	SourceType        string         `json:"source_type"`
	SourceReference   string         `json:"source_reference"`
	ExternalReference string         `json:"external_reference"`
	Excerpt           string         `json:"excerpt"`
	ExtractedFacts    map[string]any `json:"extracted_facts"`
	EvidenceStatus    EvidenceStatus `json:"evidence_status"`
	AnalystNote       string         `json:"analyst_note"`
}

type Party struct {
	ID          string    `json:"id"`
	CaseID      string    `json:"case_id"`
	Role        string    `json:"role"`
	EntityType  string    `json:"entity_type"`
	DisplayName string    `json:"display_name"`
	Identifier  string    `json:"identifier,omitempty"`
	Note        string    `json:"note,omitempty"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

type AddPartyRequest struct {
	ActorID     string `json:"actor_id"`
	Role        string `json:"role"`
	EntityType  string `json:"entity_type"`
	DisplayName string `json:"display_name"`
	Identifier  string `json:"identifier"`
	Note        string `json:"note"`
}

type Decision struct {
	ID          string          `json:"id"`
	CaseID      string          `json:"case_id"`
	Decision    DecisionOutcome `json:"decision"`
	ReasonCodes []ReasonCode    `json:"reason_codes"`
	Note        string          `json:"note"`
	Status      string          `json:"status"`
	CreatedBy   string          `json:"created_by"`
	CreatedAt   time.Time       `json:"created_at"`
}

type CloseUnresolvedRequest struct {
	ActorID     string   `json:"actor_id"`
	ReasonCodes []string `json:"reason_codes"`
	Note        string   `json:"note"`
}

type ReassignCaseRequest struct {
	ActorID    string `json:"actor_id"`
	AssigneeID string `json:"assignee_id"`
	Note       string `json:"note"`
}

type ReopenCaseRequest struct {
	ActorID string `json:"actor_id"`
	Note    string `json:"note"`
}

type AuditEvent struct {
	ID        string         `json:"id"`
	CaseID    string         `json:"case_id"`
	ActorID   string         `json:"actor_id"`
	EventType string         `json:"event_type"`
	Metadata  map[string]any `json:"metadata"`
	CreatedAt time.Time      `json:"created_at"`
}

type CaseDetail struct {
	Case        CaseSummary     `json:"case"`
	Matches     []PropertyMatch `json:"matches"`
	Evidence    []EvidenceItem  `json:"evidence"`
	Parties     []Party         `json:"parties"`
	Decisions   []Decision      `json:"decisions"`
	AuditEvents []AuditEvent    `json:"audit_events"`
}
