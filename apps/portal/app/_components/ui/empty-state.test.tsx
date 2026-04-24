import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No cases" description="Create one to get started" />);
    expect(screen.getByText("No cases")).toBeInTheDocument();
    expect(screen.getByText("Create one to get started")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(<EmptyState title="No cases" action={<button>New Case</button>} />);
    expect(screen.getByText("New Case")).toBeInTheDocument();
  });
});
