import type { CustomerStatus, MatterSummary } from "@/app/matters/types";

export type MatterDecisionFilter = "all" | "clear" | "review" | "stop" | "pending";
export type MatterStatusFilter = "all" | CustomerStatus;

export type MatterFilterState = {
  query: string;
  status: MatterStatusFilter;
  decision: MatterDecisionFilter;
};

export function buildMatterMetrics(matters: MatterSummary[]) {
  return {
    total: matters.length,
    submitted: matters.filter((matter) => matter.customer_status === "submitted").length,
    inReview: matters.filter((matter) => matter.customer_status === "in_review").length,
    resolved: matters.filter((matter) => matter.customer_status === "resolved").length,
    reopened: matters.filter((matter) => matter.customer_status === "reopened").length,
    clear: matters.filter((matter) => matter.decision === "clear").length,
    review: matters.filter((matter) => matter.decision === "review").length,
    stop: matters.filter((matter) => matter.decision === "stop").length,
    pendingDecision: matters.filter((matter) => !matter.decision).length,
  };
}

export function filterMatters(matters: MatterSummary[], filters: MatterFilterState): MatterSummary[] {
  const query = filters.query.trim().toLowerCase();

  return matters.filter((matter) => {
    const statusMatches = filters.status === "all" || matter.customer_status === filters.status;
    const decisionMatches =
      filters.decision === "all" ||
      (filters.decision === "pending" ? !matter.decision : matter.decision === filters.decision);
    const searchTarget = [
      matter.case_reference,
      matter.customer_reference,
      matter.property_description,
      matter.locality_or_area,
      matter.municipality_or_deeds_office,
      matter.title_reference,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return statusMatches && decisionMatches && (!query || searchTarget.includes(query));
  });
}
