package jobs

type RunSummary struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

func ListRuns() []RunSummary {
	return []RunSummary{}
}
