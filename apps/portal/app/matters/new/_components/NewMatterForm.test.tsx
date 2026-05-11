import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewMatterForm } from "./NewMatterForm";

describe("NewMatterForm", () => {
  it("renders required property, locality, and municipality fields", () => {
    render(<NewMatterForm onSubmit={async () => undefined} loading={false} error="" />);

    expect(screen.getByLabelText("Property Description *")).toBeInTheDocument();
    expect(screen.getByLabelText("Locality / Area *")).toBeInTheDocument();
    expect(screen.getByLabelText("Municipality / Deeds Office *")).toBeInTheDocument();
  });

  it("renders verification path text and icons", () => {
    render(<NewMatterForm onSubmit={async () => undefined} loading={false} error="" />);

    const verificationPath = screen.getByRole("region", { name: "Verification Path" });
    expect(within(verificationPath).getByText("Verification Path")).toBeInTheDocument();
    expect(screen.getByText("Deeds search")).toBeInTheDocument();
    expect(screen.getByText("Fraud detection")).toBeInTheDocument();
    expect(screen.getByText("Clear-to-lodge decision")).toBeInTheDocument();
    expect(within(verificationPath).getAllByTestId("verification-step-icon")).toHaveLength(3);
  });

  it("renders the submit button text", () => {
    render(<NewMatterForm onSubmit={async () => undefined} loading={false} error="" />);

    expect(screen.getByRole("button", { name: "Run Clear-to-Lodge Check" })).toBeInTheDocument();
  });

  it("announces API errors", () => {
    render(<NewMatterForm onSubmit={async () => undefined} loading={false} error="Failed to create matter" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to create matter");
  });

  it("shows inline validation for required fields", () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<NewMatterForm onSubmit={onSubmit} loading={false} error="" />);

    fireEvent.click(screen.getByRole("button", { name: "Run Clear-to-Lodge Check" }));

    expect(screen.getByText("Property description is required.")).toBeInTheDocument();
    expect(screen.getByText("Locality or area is required.")).toBeInTheDocument();
    expect(screen.getByText("Municipality or deeds office is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the create matter request shape", () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<NewMatterForm onSubmit={onSubmit} loading={false} error="" />);

    fireEvent.change(screen.getByLabelText("Property Description *"), { target: { value: "Erf 412 Rosebank" } });
    fireEvent.change(screen.getByLabelText("Locality / Area *"), { target: { value: "Rosebank" } });
    fireEvent.change(screen.getByLabelText("Municipality / Deeds Office *"), { target: { value: "Johannesburg" } });
    fireEvent.change(screen.getByLabelText("Title Reference"), { target: { value: "T123/2024" } });
    fireEvent.change(screen.getByLabelText("Matter Reference"), { target: { value: "ACME-1" } });
    fireEvent.change(screen.getByLabelText("Intake Note"), { target: { value: "Priority transfer" } });
    fireEvent.click(screen.getByRole("button", { name: "Run Clear-to-Lodge Check" }));

    expect(onSubmit).toHaveBeenCalledWith({
      property_description: "Erf 412 Rosebank",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "Johannesburg",
      title_reference: "T123/2024",
      customer_reference: "ACME-1",
      intake_note: "Priority transfer",
    });
  });
});
