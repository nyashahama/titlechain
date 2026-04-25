package store

import "testing"

func TestBuildCanonicalEvidenceDraftsUsesSourceLinksAsProvenance(t *testing.T) {
	links := []canonicalSourceLink{
		{
			ID:             "source-link-1",
			BatchID:        "batch-1",
			SourceRecordID: "record-1",
			FactTable:      "core.properties",
			FactID:         "fact-1",
		},
		{
			ID:             "source-link-2",
			BatchID:        "batch-1",
			SourceRecordID: "record-2",
			FactTable:      "core.title_registrations",
			FactID:         "fact-2",
		},
	}

	drafts, err := buildCanonicalEvidenceDrafts(
		"prop-1",
		"Erf 412 Rosebank Township",
		"T12345/2024",
		links,
	)
	if err != nil {
		t.Fatalf("build canonical evidence drafts: %v", err)
	}
	if len(drafts) != 2 {
		t.Fatalf("drafts = %d, want 2", len(drafts))
	}
	for i, draft := range drafts {
		if draft.SourceReference != links[i].ID {
			t.Fatalf("draft[%d].source_reference = %q, want source link id %q", i, draft.SourceReference, links[i].ID)
		}
		if draft.ExternalReference != links[i].FactTable {
			t.Fatalf("draft[%d].external_reference = %q, want fact table %q", i, draft.ExternalReference, links[i].FactTable)
		}
		if got := draft.Facts["source_link_id"]; got != links[i].ID {
			t.Fatalf("draft[%d].facts[source_link_id] = %v, want %q", i, got, links[i].ID)
		}
		if got := draft.Facts["linked_property_id"]; got != "prop-1" {
			t.Fatalf("draft[%d].facts[linked_property_id] = %v, want prop-1", i, got)
		}
	}
}
