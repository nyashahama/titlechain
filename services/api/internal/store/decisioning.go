package store

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/nyasha-hama/titlechain/services/api/internal/cases"
	"github.com/nyasha-hama/titlechain/services/api/internal/decisioning"
	"github.com/nyasha-hama/titlechain/services/api/internal/store/sqlc"
)

type DecisioningLoader struct {
	queries sqlc.Querier
}

func NewDecisioningLoader(queries sqlc.Querier) DecisioningLoader {
	return DecisioningLoader{queries: queries}
}

func (l DecisioningLoader) LoadNormalizedSnapshot(
	ctx context.Context,
	linkedPropertyID string,
	detail cases.CaseDetail,
) (decisioning.NormalizedSnapshot, error) {
	snapshot := decisioning.NormalizedSnapshot{
		LinkedPropertyID:       strings.TrimSpace(linkedPropertyID),
		CaseTitleReference:     strings.TrimSpace(detail.Case.TitleReference),
		HasConflictingEvidence: hasConflictingEvidence(detail.Evidence),
		HasFraudSignal:         hasFraudSignal(detail.Evidence),
	}

	if snapshot.LinkedPropertyID == "" {
		snapshot.OwnershipAligned = true
		return snapshot, nil
	}

	propertyID, err := parseUUID(snapshot.LinkedPropertyID)
	if err != nil {
		return decisioning.NormalizedSnapshot{}, err
	}

	row, err := l.queries.GetDecisioningPropertySnapshot(ctx, propertyID)
	if err != nil {
		return decisioning.NormalizedSnapshot{}, err
	}

	snapshot.CanonicalTitleReference = strings.TrimSpace(row.LatestTitleReference)
	snapshot.TitleStatus = toString(row.TitleStatus)
	snapshot.HasActiveEncumbrance = toBool(row.HasActiveEncumbrance)
	snapshot.HasQuarantinedRows = toBool(row.HasQuarantinedRows)
	snapshot.SourceCoverageSufficient = strings.TrimSpace(snapshot.CanonicalTitleReference) != "" && row.SourceLinkCount > 0

	coreParties, err := l.queries.ListDecisioningPropertyParties(ctx, propertyID)
	if err != nil {
		return decisioning.NormalizedSnapshot{}, err
	}
	ownershipAligned, hasPartyVariance := evaluatePartyAlignment(detail.Parties, coreParties)
	snapshot.OwnershipAligned = ownershipAligned
	snapshot.HasPartyVariance = hasPartyVariance

	return snapshot, nil
}

func evaluatePartyAlignment(caseParties []cases.Party, coreParties []sqlc.ListDecisioningPropertyPartiesRow) (bool, bool) {
	caseOwners := make([]string, 0, len(caseParties))
	for _, p := range caseParties {
		role := strings.ToLower(strings.TrimSpace(p.Role))
		if role != "seller" && role != "owner" {
			continue
		}
		name := normalizePartyName(p.DisplayName)
		if name != "" {
			caseOwners = append(caseOwners, name)
		}
	}

	coreOwners := make(map[string]struct{}, len(coreParties))
	for _, p := range coreParties {
		role := strings.ToLower(strings.TrimSpace(p.PartyRole))
		if role != "owner" && role != "seller" {
			continue
		}
		name := normalizePartyName(p.PartyName)
		if name != "" {
			coreOwners[name] = struct{}{}
		}
	}

	if len(caseOwners) == 0 || len(coreOwners) == 0 {
		return true, false
	}

	matches := 0
	for _, caseOwner := range caseOwners {
		if _, ok := coreOwners[caseOwner]; ok {
			matches++
		}
	}

	aligned := matches > 0
	variance := matches != len(caseOwners)
	if !variance {
		variance = matches != len(coreOwners)
	}

	return aligned, variance
}

func normalizePartyName(v string) string {
	v = strings.ToLower(strings.TrimSpace(v))
	v = strings.ReplaceAll(v, ".", "")
	v = strings.Join(strings.Fields(v), " ")
	return v
}

func hasConflictingEvidence(items []cases.EvidenceItem) bool {
	for _, item := range items {
		if item.EvidenceStatus == cases.EvidenceStatusConflicting {
			return true
		}
		if strings.EqualFold(item.EvidenceType, "source_conflict") {
			return true
		}
	}
	return false
}

func hasFraudSignal(items []cases.EvidenceItem) bool {
	for _, item := range items {
		evidenceType := strings.ToLower(strings.TrimSpace(item.EvidenceType))
		if strings.Contains(evidenceType, "fraud") || strings.Contains(evidenceType, "anomaly") {
			return true
		}
		if item.ExtractedFacts == nil {
			continue
		}
		if v, ok := item.ExtractedFacts["fraud_signal"].(bool); ok && v {
			return true
		}
		if v, ok := item.ExtractedFacts["anomaly_signal"].(bool); ok && v {
			return true
		}
	}
	return false
}

func toString(v any) string {
	switch t := v.(type) {
	case string:
		return t
	case pgtype.Text:
		if t.Valid {
			return t.String
		}
	}
	return ""
}

func toBool(v any) bool {
	switch t := v.(type) {
	case bool:
		return t
	case pgtype.Bool:
		return t.Valid && t.Bool
	}
	return false
}
