package jobs

import "time"

type RunSummary struct {
	ID            string     `json:"id"`
	RunType       string     `json:"run_type"`
	Status        string     `json:"status"`
	StartedAt     *time.Time `json:"started_at,omitempty"`
	FinishedAt    *time.Time `json:"finished_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	TotalJobs     int        `json:"total_jobs"`
	CompletedJobs int        `json:"completed_jobs"`
	FailedJobs    int        `json:"failed_jobs"`
	LatestError   string     `json:"latest_error,omitempty"`
}

type StartSourceIngestionRequest struct {
	SourceName    string `json:"source_name"`
	BatchKey      string `json:"batch_key"`
	PayloadURI    string `json:"payload_uri"`
	PayloadSHA256 string `json:"payload_sha256"`
}

var IngestionJobKinds = []string{"raw_landing", "stage_normalization", "core_materialization", "read_refresh"}
