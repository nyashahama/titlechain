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

  it("filters matters by status", () => {
    render(<MatterQueue matters={matters} />);

    fireEvent.click(screen.getByRole("button", { name: "Resolved" }));

    expect(screen.queryByText("Erf 412 Rosebank")).not.toBeInTheDocument();
    expect(screen.getByText("Section 8 Sandton")).toBeInTheDocument();
  });

  it("filters matters by decision", () => {
    render(<MatterQueue matters={matters} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(screen.queryByText("Erf 412 Rosebank")).not.toBeInTheDocument();
    expect(screen.getByText("Section 8 Sandton")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pending" }));

    expect(screen.getByText("Erf 412 Rosebank")).toBeInTheDocument();
    expect(screen.queryByText("Section 8 Sandton")).not.toBeInTheDocument();
  });

  it("exposes accessible filter groups and pressed buttons", () => {
    render(<MatterQueue matters={matters} />);

    expect(screen.getByRole("group", { name: "Matter status" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Matter decision" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All statuses" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All decisions" })).toHaveAttribute("aria-pressed", "true");
  });

  it("reveals the copy action when it receives keyboard focus", () => {
    render(<MatterQueue matters={matters} />);

    expect(screen.getByRole("button", { name: "Copy TC-001" }).parentElement).toHaveClass("focus-within:opacity-100");
  });
});
