import type {
  MatterSummary,
  MatterDetail,
  CreateMatterRequest,
  ReopenMatterRequest,
  SummaryExport,
} from "./types";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `API error: ${res.status}`);
  }
  return res.json();
}

export async function listMatters(status?: string): Promise<MatterSummary[]> {
  const params = status ? `?status=${status}` : "";
  return fetchJson<MatterSummary[]>(`/api/pilot/matters${params}`, {
    credentials: "include",
    cache: "no-store",
  });
}

export async function getMatterDetail(matterId: string): Promise<MatterDetail> {
  return fetchJson<MatterDetail>(`/api/pilot/matters/${matterId}`, {
    credentials: "include",
    cache: "no-store",
  });
}

export async function createMatter(req: CreateMatterRequest): Promise<MatterSummary> {
  return fetchJson<MatterSummary>("/api/pilot/matters", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(req),
  });
}

export async function reopenMatter(matterId: string, req: ReopenMatterRequest): Promise<MatterDetail> {
  return fetchJson<MatterDetail>(`/api/pilot/matters/${matterId}/reopen`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(req),
  });
}

export async function createSummary(matterId: string): Promise<SummaryExport> {
  return fetchJson<SummaryExport>(`/api/pilot/matters/${matterId}/summary`, {
    method: "POST",
    credentials: "include",
  });
}
