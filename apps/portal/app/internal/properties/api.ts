import { PropertySummary } from "./types";

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

export async function listProperties(params?: { q?: string; locality?: string; status?: string }): Promise<PropertySummary[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.locality) search.set("locality", params.locality);
  if (params?.status) search.set("status", params.status);
  return fetchJson<PropertySummary[]>(`/api/internal/portal/properties?${search.toString()}`);
}