package property

type PropertySummary struct {
	PropertyID string `json:"property_id"`
	Status     string `json:"status"`
}

func ListProperties() []PropertySummary {
	return []PropertySummary{}
}
