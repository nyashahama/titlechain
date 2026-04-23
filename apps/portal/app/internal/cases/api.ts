import {
  Analyst,
  CaseDetail,
  CaseStatus,
  CaseSummary,
  CloseUnresolvedInput,
  CreateCaseInput,
  AddEvidenceInput,
  ReasonCode,
  RecordDecisionInput,
  ReassignCaseInput,
} from "./types";

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listAnalysts(): Promise<Analyst[]> {
  return fetchJson<Analyst[]>("/api/internal/analysts");
}

export async function listReasonCodes(): Promise<ReasonCode[]> {
  return fetchJson<ReasonCode[]>("/api/internal/reason-codes");
}

export async function listCases(params?: {
  status?: CaseStatus;
  assignee_id?: string;
}): Promise<CaseSummary[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.assignee_id) search.set("assignee_id", params.assignee_id);
  const query = search.toString();
  return fetchJson<CaseSummary[]>(`/api/internal/cases${query ? `?${query}` : ""}`);
}

export async function getCase(caseId: string): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(`/api/internal/cases/${caseId}`);
}

export async function createCase(input: CreateCaseInput): Promise<CaseDetail> {
  return fetchJson<CaseDetail>("/api/internal/cases", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function addEvidence(
  caseId: string,
  input: AddEvidenceInput
): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(`/api/internal/cases/${caseId}/evidence`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function recordDecision(
  caseId: string,
  input: RecordDecisionInput
): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(`/api/internal/cases/${caseId}/decision`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function closeUnresolved(
  caseId: string,
  input: CloseUnresolvedInput
): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(`/api/internal/cases/${caseId}/close-unresolved`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function reassignCase(
  caseId: string,
  input: ReassignCaseInput
): Promise<CaseDetail> {
  return fetchJson<CaseDetail>(`/api/internal/cases/${caseId}/assignment`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
