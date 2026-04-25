import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CaseRow } from "./case-row";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CaseRow", () => {
  it("renders case reference and property description", () => {
    const caseItem = {
      id: "case-1",
      case_reference: "TC-001",
      property_description: "Erf 412 Rosebank",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "Johannesburg",
      status: "open" as const,
      assignee_id: "ana-001",
      created_by: "ana-001",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(<CaseRow caseItem={caseItem} index={0} analystMap={new Map([["ana-001", "Nyasha"]])} />);
    expect(screen.getByText("TC-001")).toBeInTheDocument();
    expect(screen.getByText("Erf 412 Rosebank")).toBeInTheDocument();
  });
});
