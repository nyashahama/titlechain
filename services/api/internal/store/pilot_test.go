package store

import (
	"testing"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/nyasha-hama/titlechain/services/api/internal/pilot"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

func TestSelectSourceBackedPropertyCandidateSelectsSingleHighConfidenceCandidate(t *testing.T) {
	propertyID := mustTestUUID(t, "11111111-1111-1111-1111-111111111111")
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:            propertyID,
			ConfidenceScore:       85,
			SourceProvenanceCount: 1,
		},
	}

	got, ok := selectSourceBackedPropertyCandidate(pilot.CreateMatterRequest{}, candidates)

	if !ok {
		t.Fatal("candidate rejected, want selected")
	}
	if uuidToString(got) != uuidToString(propertyID) {
		t.Fatalf("selected property = %s, want %s", uuidToString(got), uuidToString(propertyID))
	}
}

func TestSelectSourceBackedPropertyCandidateRejectsDescriptionMatchWithConflictingContext(t *testing.T) {
	req := pilot.CreateMatterRequest{
		PropertyDescription:       "Erf 123",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Municipality A",
	}
	tests := []struct {
		name      string
		candidate sqlc.FindPropertySummaryCandidatesRow
	}{
		{
			name: "municipality conflict",
			candidate: sqlc.FindPropertySummaryCandidatesRow{
				PropertyID:                mustTestUUID(t, "11111111-1111-1111-1111-111111111111"),
				PropertyDescription:       "Erf 123",
				LocalityOrArea:            "Rosebank",
				MunicipalityOrDeedsOffice: "Municipality B",
				ConfidenceScore:           85,
				SourceProvenanceCount:     1,
			},
		},
		{
			name: "locality conflict",
			candidate: sqlc.FindPropertySummaryCandidatesRow{
				PropertyID:                mustTestUUID(t, "22222222-2222-2222-2222-222222222222"),
				PropertyDescription:       "Erf 123",
				LocalityOrArea:            "Parktown",
				MunicipalityOrDeedsOffice: "Municipality A",
				ConfidenceScore:           85,
				SourceProvenanceCount:     1,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got, ok := selectSourceBackedPropertyCandidate(req, []sqlc.FindPropertySummaryCandidatesRow{tt.candidate}); ok {
				t.Fatalf("selected conflicting candidate %s, want no selection", uuidToString(got))
			}
		})
	}
}

func TestSelectSourceBackedPropertyCandidateSelectsDescriptionMatchWithMatchingContext(t *testing.T) {
	propertyID := mustTestUUID(t, "11111111-1111-1111-1111-111111111111")
	req := pilot.CreateMatterRequest{
		PropertyDescription:       "Erf 123",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Municipality A",
	}
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:                propertyID,
			PropertyDescription:       "Erf 123",
			LocalityOrArea:            "Rosebank",
			MunicipalityOrDeedsOffice: "Municipality A",
			ConfidenceScore:           85,
			SourceProvenanceCount:     1,
		},
	}

	got, ok := selectSourceBackedPropertyCandidate(req, candidates)

	if !ok {
		t.Fatal("matching context candidate rejected, want selected")
	}
	if uuidToString(got) != uuidToString(propertyID) {
		t.Fatalf("selected property = %s, want %s", uuidToString(got), uuidToString(propertyID))
	}
}

func TestSelectSourceBackedPropertyCandidateSelectsExactTitleDespiteConflictingContext(t *testing.T) {
	propertyID := mustTestUUID(t, "11111111-1111-1111-1111-111111111111")
	req := pilot.CreateMatterRequest{
		TitleReference:            "T123/2026",
		PropertyDescription:       "Erf 123",
		LocalityOrArea:            "Rosebank",
		MunicipalityOrDeedsOffice: "Municipality A",
	}
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:                propertyID,
			PropertyDescription:       "Erf 123",
			LocalityOrArea:            "Parktown",
			MunicipalityOrDeedsOffice: "Municipality B",
			TitleReference:            "T123/2026",
			ConfidenceScore:           100,
			SourceProvenanceCount:     1,
		},
	}

	got, ok := selectSourceBackedPropertyCandidate(req, candidates)

	if !ok {
		t.Fatal("exact title candidate rejected, want selected")
	}
	if uuidToString(got) != uuidToString(propertyID) {
		t.Fatalf("selected property = %s, want %s", uuidToString(got), uuidToString(propertyID))
	}
}

func TestSelectSourceBackedPropertyCandidateSelectsOnlyQualifyingCandidate(t *testing.T) {
	propertyID := mustTestUUID(t, "11111111-1111-1111-1111-111111111111")
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:            propertyID,
			ConfidenceScore:       85,
			SourceProvenanceCount: 1,
		},
		{
			PropertyID:            mustTestUUID(t, "22222222-2222-2222-2222-222222222222"),
			ConfidenceScore:       70,
			SourceProvenanceCount: 2,
		},
		{
			PropertyID:            mustTestUUID(t, "33333333-3333-3333-3333-333333333333"),
			ConfidenceScore:       100,
			SourceProvenanceCount: 0,
		},
	}

	got, ok := selectSourceBackedPropertyCandidate(pilot.CreateMatterRequest{}, candidates)

	if !ok {
		t.Fatal("qualifying candidate rejected, want selected")
	}
	if uuidToString(got) != uuidToString(propertyID) {
		t.Fatalf("selected property = %s, want %s", uuidToString(got), uuidToString(propertyID))
	}
}

func TestSelectSourceBackedPropertyCandidateRejectsMultipleMatches(t *testing.T) {
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:            mustTestUUID(t, "11111111-1111-1111-1111-111111111111"),
			ConfidenceScore:       100,
			SourceProvenanceCount: 1,
		},
		{
			PropertyID:            mustTestUUID(t, "22222222-2222-2222-2222-222222222222"),
			ConfidenceScore:       85,
			SourceProvenanceCount: 1,
		},
	}

	if got, ok := selectSourceBackedPropertyCandidate(pilot.CreateMatterRequest{}, candidates); ok {
		t.Fatalf("selected ambiguous candidate %s, want no selection", uuidToString(got))
	}
}

func TestSelectSourceBackedPropertyCandidateRejectsBelowThresholdCandidate(t *testing.T) {
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:            mustTestUUID(t, "11111111-1111-1111-1111-111111111111"),
			ConfidenceScore:       70,
			SourceProvenanceCount: 1,
		},
	}

	if got, ok := selectSourceBackedPropertyCandidate(pilot.CreateMatterRequest{}, candidates); ok {
		t.Fatalf("selected below-threshold candidate %s, want no selection", uuidToString(got))
	}
}

func TestSelectSourceBackedPropertyCandidateRejectsSourceLessCandidate(t *testing.T) {
	candidates := []sqlc.FindPropertySummaryCandidatesRow{
		{
			PropertyID:            mustTestUUID(t, "11111111-1111-1111-1111-111111111111"),
			ConfidenceScore:       100,
			SourceProvenanceCount: 0,
		},
	}

	if got, ok := selectSourceBackedPropertyCandidate(pilot.CreateMatterRequest{}, candidates); ok {
		t.Fatalf("selected source-less candidate %s, want no selection", uuidToString(got))
	}
}

func mustTestUUID(t *testing.T, value string) pgtype.UUID {
	t.Helper()
	id, err := parseUUID(value)
	if err != nil {
		t.Fatalf("parse UUID %q: %v", value, err)
	}
	return id
}
