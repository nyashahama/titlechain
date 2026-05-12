import type { EvidenceReadinessSummary } from "./types";

const fallbackEvidenceReadiness: EvidenceReadinessSummary = {
  state: "needs_source_match",
  label: "Readiness unavailable",
  description: "Evidence readiness is not available for this case yet.",
  confirmed_evidence_count: 0,
  evidence_count: 0,
  has_linked_property: false,
  has_conflict: false,
  missing: ["source_match", "confirmed_evidence"],
};

export function caseEvidenceReadiness(
  readiness?: EvidenceReadinessSummary | null
): EvidenceReadinessSummary {
  return readiness ?? fallbackEvidenceReadiness;
}
