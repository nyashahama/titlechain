import type { EvidenceReadinessSummary } from "./types";

const fallbackEvidenceReadiness: EvidenceReadinessSummary = {
  state: "unknown",
  label: "Readiness unavailable",
  description: "Evidence readiness is not available for this case yet.",
  confirmed_evidence_count: 0,
  evidence_count: 0,
  has_linked_property: false,
  has_conflict: true,
  missing: [],
};

export function caseEvidenceReadiness(
  readiness?: EvidenceReadinessSummary | null
): EvidenceReadinessSummary {
  return readiness ?? fallbackEvidenceReadiness;
}
