package decisioning

const EngineVersion = "decision-engine-v1"

type DecisionOutcome string

const (
	DecisionClear  DecisionOutcome = "clear"
	DecisionReview DecisionOutcome = "review"
	DecisionStop   DecisionOutcome = "stop"
)

type NormalizedSnapshot struct {
	LinkedPropertyID         string
	CanonicalTitleReference  string
	CaseTitleReference       string
	TitleStatus              string
	HasActiveEncumbrance     bool
	HasQuarantinedRows       bool
	OwnershipAligned         bool
	SourceCoverageSufficient bool
	HasPartyVariance         bool
	HasConflictingEvidence   bool
	HasFraudSignal           bool
}

type CaseFacts struct {
	HasLinkedProperty         bool
	HasCanonicalTitle         bool
	HasTitleReference         bool
	HasTitleReferenceMismatch bool
	HasActiveInterdict        bool
	HasActiveEncumbrance      bool
	HasQuarantinedSourceRows  bool
	OwnershipAligned          bool
	SourceCoverageSufficient  bool
	HasPartyVariance          bool
	HasConflictingEvidence    bool
	HasFraudSignal            bool
}

type Proposal struct {
	EngineVersion string
	Decision      DecisionOutcome
	Summary       string
	ReasonCodes   []string
	Explanation   map[string]any
}
