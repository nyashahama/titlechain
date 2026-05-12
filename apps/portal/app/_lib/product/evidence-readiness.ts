import type { ProductTone } from "./status";

export function evidenceReadinessTone(state: string): ProductTone {
  if (state === "ready" || state === "ready_for_decision") return "success";
  if (state === "conflict" || state === "has_conflict") return "danger";
  if (state === "exception" || state === "exception_approved") return "warning";
  if (state.startsWith("needs_")) return "info";
  return "muted";
}

export function evidenceReadinessAction(state: string): string {
  switch (state) {
    case "ready":
    case "ready_for_decision":
      return "TitleChain is using confirmed evidence for this matter.";
    case "needs_source_match":
      return "TitleChain is still matching this matter to a source-backed property record.";
    case "needs_evidence":
      return "TitleChain is waiting for confirmed supporting evidence before relying on this matter record.";
    case "conflict":
    case "has_conflict":
      return "TitleChain found conflicting evidence that needs review before this matter record can be relied on.";
    case "exception":
    case "exception_approved":
      return "This matter was resolved with an approved evidence exception. Treat the decision as support, not a deeds-office guarantee.";
    default:
      return "Evidence readiness is not available for this matter yet.";
  }
}
