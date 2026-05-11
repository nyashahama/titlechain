package analytics

import "time"

const (
	RangeSevenDays  = "7d"
	RangeThirtyDays = "30d"
	RangeNinetyDays = "90d"
	RangeAll        = "all"
)

type Range struct {
	Key  string     `json:"key"`
	From *time.Time `json:"from,omitempty"`
	To   time.Time  `json:"to"`
}

type Window struct {
	Key  string
	From *time.Time
	To   time.Time
}

type Overview struct {
	Range            Range              `json:"range"`
	OperatingSummary OperatingSummary   `json:"operating_summary"`
	DecisionMix      []DecisionMetric   `json:"decision_mix"`
	ReasonCodes      []ReasonCodeMetric `json:"reason_codes"`
	Evidence         EvidenceAnalytics  `json:"evidence"`
	SourceHealth     SourceHealth       `json:"source_health"`
	RiskQueue        []RiskQueueItem    `json:"risk_queue"`
}

type OperatingSummary struct {
	SubmittedCount          int `json:"submitted_count"`
	ResolvedCount           int `json:"resolved_count"`
	InReviewCount           int `json:"in_review_count"`
	ReopenedCount           int `json:"reopened_count"`
	UnresolvedCount         int `json:"unresolved_count"`
	AverageSecondsToResolve int `json:"average_seconds_to_resolve"`
	OldestInReviewSeconds   int `json:"oldest_in_review_seconds"`
	AcceptedProposalCount   int `json:"accepted_proposal_count"`
	ManualOverrideCount     int `json:"manual_override_count"`
}

type DecisionMetric struct {
	Decision              string `json:"decision"`
	Count                 int    `json:"count"`
	ManualCount           int    `json:"manual_count"`
	ManualOverrideCount   int    `json:"manual_override_count"`
	AcceptedProposalCount int    `json:"accepted_proposal_count"`
}

type ReasonCodeMetric struct {
	Code     string `json:"code"`
	Label    string `json:"label"`
	Category string `json:"category"`
	Count    int    `json:"count"`
}

type EvidenceAnalytics struct {
	TotalItems                    int                    `json:"total_items"`
	CasesWithoutEvidence          int                    `json:"cases_without_evidence"`
	CasesWithoutConfirmedEvidence int                    `json:"cases_without_confirmed_evidence"`
	StatusMix                     []EvidenceStatusMetric `json:"status_mix"`
	SourceTypeMix                 []EvidenceSourceMetric `json:"source_type_mix"`
}

type EvidenceStatusMetric struct {
	Status string `json:"status"`
	Count  int    `json:"count"`
}

type EvidenceSourceMetric struct {
	SourceType string `json:"source_type"`
	Count      int    `json:"count"`
}

type SourceHealth struct {
	LatestRunID            string     `json:"latest_run_id,omitempty"`
	LatestRunStatus        string     `json:"latest_run_status"`
	LatestError            string     `json:"latest_error"`
	FailedJobCount         int        `json:"failed_job_count"`
	PendingJobCount        int        `json:"pending_job_count"`
	QuarantinedRecordCount int        `json:"quarantined_record_count"`
	SourceLinkCount        int        `json:"source_link_count"`
	LastSuccessfulRunAt    *time.Time `json:"last_successful_run_at,omitempty"`
}

type RiskQueueItem struct {
	CaseID           string   `json:"case_id"`
	CaseReference    string   `json:"case_reference"`
	Status           string   `json:"status"`
	CustomerStatus   string   `json:"customer_status"`
	OrganizationName string   `json:"organization_name"`
	AgeSeconds       int      `json:"age_seconds"`
	RiskReasons      []string `json:"risk_reasons"`
}
