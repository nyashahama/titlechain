import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MatterSummary } from "@/app/matters/types";
import { CommandCenter } from "./CommandCenter";

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
    evidence_readiness: {
      state: "needs_source_match",
      label: "Needs source match",
      description: "Match this matter to a source-backed property record.",
      confirmed_evidence_count: 0,
      evidence_count: 0,
      missing: ["source_match"],
    },
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
    evidence_readiness: {
      state: "exception_approved",
      label: "Exception approved",
      description: "A current decision has approved an evidence exception.",
      confirmed_evidence_count: 0,
      evidence_count: 0,
      missing: [],
    },
    submitted_at: "2026-05-02T08:00:00Z",
    updated_at: "2026-05-02T09:00:00Z",
  },
  {
    id: "m3",
    case_id: "c3",
    case_reference: "TC-003",
    customer_reference: "ACME-3",
    customer_status: "in_review",
    property_description: "Farm 9 Stellenbosch",
    locality_or_area: "Stellenbosch",
    municipality_or_deeds_office: "Cape Town",
    title_reference: "T789/2023",
    decision: "review",
    evidence_readiness: {
      state: "needs_evidence",
      label: "Needs evidence",
      description: "Attach confirmed evidence before decisioning.",
      confirmed_evidence_count: 0,
      evidence_count: 0,
      missing: ["confirmed_evidence"],
    },
    submitted_at: "2026-05-03T08:00:00Z",
    updated_at: "2026-05-03T09:00:00Z",
  },
];

describe("CommandCenter", () => {
  it("renders queue health and decision exceptions from matter data", () => {
    render(<CommandCenter matters={matters} />);
    expect(screen.getByText("Queue health")).toBeInTheDocument();
    expect(screen.getByText("Decision exceptions")).toBeInTheDocument();
    expect(screen.getByText("Section 8 Sandton")).toBeInTheDocument();
  });

  it("shows decision counts and recent matter activity", () => {
    render(<CommandCenter matters={matters} />);

    expect(screen.getByText("Stop decisions")).toBeInTheDocument();
    expect(screen.getByText("Pending decisions")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
    expect(screen.getByText("Section 8 Sandton updated")).toBeInTheDocument();
    expect(screen.getByText("Erf 412 Rosebank updated")).toBeInTheDocument();
  });

  it("renders evidence work queue counts from matter readiness states", () => {
    render(<CommandCenter matters={matters} />);

    const queues = screen.getByRole("region", { name: /Evidence work queues/i });
    expect(within(queues).getByText("Needs source match")).toBeInTheDocument();
    expect(within(queues).getByText("Needs evidence")).toBeInTheDocument();
    expect(within(queues).getByText("Exception approved")).toBeInTheDocument();
    expect(within(queues).getAllByText("1")).toHaveLength(3);
  });
});
