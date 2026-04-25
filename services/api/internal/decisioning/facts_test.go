package decisioning

import "testing"

func TestBuildFacts_StopForActiveInterdict(t *testing.T) {
	facts := BuildFacts(NormalizedSnapshot{
		LinkedPropertyID:         "prop-1",
		CanonicalTitleReference:  "T 12345 / 2024",
		CaseTitleReference:       "T 12345 / 2024",
		TitleStatus:              "active_interdict",
		OwnershipAligned:         true,
		SourceCoverageSufficient: true,
	})

	if !facts.HasActiveInterdict {
		t.Fatal("HasActiveInterdict = false, want true")
	}
}

func TestBuildFacts_TitleReferenceMismatch(t *testing.T) {
	facts := BuildFacts(NormalizedSnapshot{
		LinkedPropertyID:        "prop-1",
		CanonicalTitleReference: "T12345/2024",
		CaseTitleReference:      "T99999/2024",
	})

	if !facts.HasTitleReferenceMismatch {
		t.Fatal("HasTitleReferenceMismatch = false, want true")
	}
}
