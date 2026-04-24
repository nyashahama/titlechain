import { RunSummary } from "./types";

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function listRuns(): Promise<RunSummary[]> {
  return fetchJson<RunSummary[]>("/api/internal/ops/runs");
}

export async function startSeedProjectionRun(): Promise<RunSummary> {
  return fetchJson<RunSummary>("/api/internal/ops/runs/property-sync", {
    method: "POST",
  });
}