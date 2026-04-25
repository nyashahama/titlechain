package cases

import "context"

type Repository interface {
	ListAnalysts(ctx context.Context) ([]Analyst, error)
	ListReasonCodes(ctx context.Context) ([]ReasonCode, error)
	ListCases(ctx context.Context, filter ListCasesFilter) ([]CaseSummary, error)
	GetCaseDetail(ctx context.Context, caseID string) (CaseDetail, error)
	CreateCaseWorkflow(ctx context.Context, req CreateCaseRequest, caseReference string) (CaseDetail, error)
	ConfirmPropertyMatchWorkflow(ctx context.Context, caseID string, req ConfirmPropertyMatchRequest) (CaseDetail, error)
	AddEvidenceWorkflow(ctx context.Context, caseID string, req AddEvidenceRequest) (CaseDetail, error)
	AddPartyWorkflow(ctx context.Context, caseID string, req AddPartyRequest) (CaseDetail, error)
	ReassignCaseWorkflow(ctx context.Context, caseID string, req ReassignCaseRequest) (CaseDetail, error)
	ReevaluateCaseWorkflow(ctx context.Context, caseID, actorID string) (CaseDetail, error)
	AcceptProposalWorkflow(ctx context.Context, caseID string, req AcceptProposalRequest) (CaseDetail, error)
	RecordDecisionWorkflow(ctx context.Context, caseID string, req RecordDecisionRequest) (CaseDetail, error)
	CloseUnresolvedWorkflow(ctx context.Context, caseID string, req CloseUnresolvedRequest) (CaseDetail, error)
	ReopenCaseWorkflow(ctx context.Context, caseID string, req ReopenCaseRequest) (CaseDetail, error)
}
