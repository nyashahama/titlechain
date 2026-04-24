package jobs

type RunSummary struct {
	ID            string `json:"id"`
	RunType       string `json:"run_type"`
	Status        string `json:"status"`
	TotalJobs     int    `json:"total_jobs"`
	CompletedJobs int    `json:"completed_jobs"`
	FailedJobs    int    `json:"failed_jobs"`
	LatestError   string `json:"latest_error,omitempty"`
	StartedAt     string `json:"started_at,omitempty"`
	FinishedAt    string `json:"finished_at,omitempty"`
	CreatedAt     string `json:"created_at"`
}

type StartSourceIngestionRequest struct {
	SourceName string `json:"source_name"`
	BatchKey   string `json:"batch_key"`
}