import { describe, expect, it } from "vitest";
import type { MatterSummary } from "@/app/matters/types";
import { buildMatterMetrics, filterMatters } from "./matter-metrics";

const matters: MatterSummary[] = [
  {
    id: "m1",
    case_id: "c1",
    case_reference: "TC-001",
    customer_reference: "ACME-1",
    customer_status: "submitted",
    property_description: "Erf 412 Rosebank",
    locality_or_area: "Rosebank",
    municipality_or_deeds_office: "Johannesburg",
    title_reference: "T123/2024",
    decision: "",
    submitted_at: "2026-05-01T08:00:00Z",
    updated_at: "2026-05-01T09:00:00Z",
  },
  {
    id: "m2",
    case_id: "c2",
    case_reference: "TC-002",
    customer_reference: "ACME-2",
    customer_status: "resolved",
    property_description: "Section 8 Sandton",
    locality_or_area: "Sandton",
    municipality_or_deeds_office: "Johannesburg",
    title_reference: "T456/2022",
    decision: "stop",
    submitted_at: "2026-05-02T08:00:00Z",
    updated_at: "2026-05-02T09:00:00Z",
  },
];

describe("matter metrics", () => {
  it("counts matter statuses and decisions", () => {
    expect(buildMatterMetrics(matters)).toMatchObject({
      total: 2,
      submitted: 1,
      resolved: 1,
      clear: 0,
      review: 0,
      stop: 1,
      pendingDecision: 1,
    });
  });

  it("filters queue rows by search, status, and decision", () => {
    expect(filterMatters(matters, { query: "sandton", status: "all", decision: "all" })).toHaveLength(1);
    expect(filterMatters(matters, { query: "", status: "submitted", decision: "all" })).toHaveLength(1);
    expect(filterMatters(matters, { query: "", status: "all", decision: "stop" })).toHaveLength(1);
  });
});
