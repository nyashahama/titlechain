import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PropertyResults } from "./_components/property-results";

vi.mock("./api", () => ({
  listProperties: vi.fn().mockResolvedValue([
    {
      property_id: "prop-1",
      property_description: "Erf 412 Rosebank Township",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "Johannesburg",
      title_reference: "T12345/2024",
      current_owner_name: "Maseko Family Trust",
      status: "No material blocker seeded",
      updated_at: "2026-04-24T09:12:00Z",
    },
  ]),
}));

describe("properties page", () => {
  it("renders property results with open case link", () => {
    const properties = [
      {
        property_id: "prop-1",
        property_description: "Erf 412 Rosebank Township",
        locality_or_area: "Rosebank",
        municipality_or_deeds_office: "Johannesburg",
        title_reference: "T12345/2024",
        current_owner_name: "Maseko Family Trust",
        status: "No material blocker seeded",
        updated_at: "2026-04-24T09:12:00Z",
      },
    ];
    render(<PropertyResults properties={properties} />);
    expect(screen.getByText("Erf 412 Rosebank Township")).toBeInTheDocument();
    expect(screen.getByText(/Open Case/i)).toBeInTheDocument();
  });
});