import { render, screen } from "@testing-library/react";
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
});
