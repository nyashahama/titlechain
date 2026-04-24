package property

import "time"

type PropertySummary struct {
	PropertyID                string `json:"property_id"`
	PropertyDescription       string `json:"property_description"`
	LocalityOrArea            string `json:"locality_or_area"`
	MunicipalityOrDeedsOffice string `json:"municipality_or_deeds_office"`
	TitleReference            string `json:"title_reference"`
	CurrentOwnerName          string `json:"current_owner_name,omitempty"`
	Status                    string `json:"status"`
	UpdatedAt                 time.Time `json:"updated_at"`
}

type ListFilter struct {
	Query    string
	Locality string
	Status   string
	Limit    int
}