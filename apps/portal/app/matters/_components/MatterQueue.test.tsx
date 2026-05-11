import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MatterSummary } from "../types";
import { MatterQueue } from "./MatterQueue";

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

describe("MatterQueue", () => {
  it("renders matters and filters by search", () => {
    render(<MatterQueue matters={matters} />);
    expect(screen.getByText("Erf 412 Rosebank")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search matters"), {
      target: { value: "sandton" },
    });
    expect(screen.queryByText("Erf 412 Rosebank")).not.toBeInTheDocument();
    expect(screen.getByText("Section 8 Sandton")).toBeInTheDocument();
  });
});
