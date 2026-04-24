import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PropertyCard } from "./property-card";

describe("PropertyCard", () => {
  it("renders property description and locality", () => {
    const property = {
      property_id: "prop-1",
      property_description: "Erf 412 Rosebank",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "Johannesburg",
      title_reference: "T12345/2024",
      current_owner_name: "Maseko Family Trust",
      status: "No material blocker",
      updated_at: "2026-04-24T09:12:00Z",
    };

    render(<PropertyCard property={property} />);
    expect(screen.getByText("Erf 412 Rosebank")).toBeInTheDocument();
    expect(screen.getByText(/Rosebank · Johannesburg/)).toBeInTheDocument();
    expect(screen.getByText(/Open Case/)).toBeInTheDocument();
  });
});
