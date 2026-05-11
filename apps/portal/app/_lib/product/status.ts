export type ProductTone = "muted" | "info" | "success" | "warning" | "danger";

export type ProductStatusMeta = {
  label: string;
  tone: ProductTone;
};

const matterStatus: Record<string, ProductStatusMeta> = {
  submitted: { label: "Submitted", tone: "info" },
  in_review: { label: "In Review", tone: "warning" },
  resolved: { label: "Resolved", tone: "success" },
  reopened: { label: "Reopened", tone: "info" },
};

const caseStatus: Record<string, ProductStatusMeta> = {
  open: { label: "Open", tone: "info" },
  in_review: { label: "In Review", tone: "warning" },
  resolved: { label: "Resolved", tone: "success" },
  closed_unresolved: { label: "Unresolved", tone: "danger" },
  reopened: { label: "Reopened", tone: "info" },
};

const decisionStatus: Record<string, ProductStatusMeta> = {
  clear: { label: "Clear to Lodge", tone: "success" },
  review: { label: "Review Required", tone: "warning" },
  stop: { label: "Stop", tone: "danger" },
  "": { label: "Pending", tone: "muted" },
};

const evidenceStatus: Record<string, ProductStatusMeta> = {
  captured: { label: "Captured", tone: "info" },
  confirmed: { label: "Confirmed", tone: "success" },
  conflicting: { label: "Conflicting", tone: "danger" },
  superseded: { label: "Superseded", tone: "muted" },
  verified: { label: "Verified", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

const runStatus: Record<string, ProductStatusMeta> = {
  pending: { label: "Pending", tone: "warning" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
};

export function getMatterStatusMeta(status: string): ProductStatusMeta {
  return matterStatus[status] ?? { label: status.replace(/_/g, " "), tone: "muted" };
}

export function getCaseStatusMeta(status: string): ProductStatusMeta {
  return caseStatus[status] ?? { label: status.replace(/_/g, " "), tone: "muted" };
}

export function getDecisionMeta(decision: string | null | undefined): ProductStatusMeta {
  return decisionStatus[decision ?? ""] ?? { label: decision ?? "Pending", tone: "muted" };
}

export function getEvidenceStatusMeta(status: string): ProductStatusMeta {
  return evidenceStatus[status] ?? { label: status.replace(/_/g, " "), tone: "muted" };
}

export function getRunStatusMeta(status: string): ProductStatusMeta {
  return runStatus[status] ?? { label: status.replace(/_/g, " "), tone: "muted" };
}
