package decisioning

import "strings"

func BuildFacts(snapshot NormalizedSnapshot) CaseFacts {
	hasTitleReference := strings.TrimSpace(snapshot.CaseTitleReference) != ""
	hasCanonicalTitle := strings.TrimSpace(snapshot.CanonicalTitleReference) != ""

	titleReferenceMismatch := false
	if hasTitleReference && hasCanonicalTitle {
		titleReferenceMismatch = !strings.EqualFold(
			normalizeTitleReference(snapshot.CaseTitleReference),
			normalizeTitleReference(snapshot.CanonicalTitleReference),
		)
	}

	return CaseFacts{
		HasLinkedProperty:         strings.TrimSpace(snapshot.LinkedPropertyID) != "",
		HasCanonicalTitle:         hasCanonicalTitle,
		HasTitleReference:         hasTitleReference,
		HasTitleReferenceMismatch: titleReferenceMismatch,
		HasActiveInterdict:        strings.EqualFold(strings.TrimSpace(snapshot.TitleStatus), "active_interdict"),
		HasActiveEncumbrance:      snapshot.HasActiveEncumbrance,
		HasQuarantinedSourceRows:  snapshot.HasQuarantinedRows,
		OwnershipAligned:          snapshot.OwnershipAligned,
		SourceCoverageSufficient:  snapshot.SourceCoverageSufficient,
		HasPartyVariance:          snapshot.HasPartyVariance,
		HasConflictingEvidence:    snapshot.HasConflictingEvidence,
		HasFraudSignal:            snapshot.HasFraudSignal,
	}
}

func normalizeTitleReference(v string) string {
	trimmed := strings.TrimSpace(strings.ToLower(v))
	trimmed = strings.ReplaceAll(trimmed, " ", "")
	return strings.ReplaceAll(trimmed, "\t", "")
}
