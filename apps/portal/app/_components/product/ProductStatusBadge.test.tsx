import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductStatusBadge } from "./ProductStatusBadge";

describe("ProductStatusBadge", () => {
  it("renders semantic labels", () => {
    render(<ProductStatusBadge label="Clear to Lodge" tone="success" />);
    expect(screen.getByText("Clear to Lodge")).toBeInTheDocument();
  });

  it("uses compact 8px radius", () => {
    render(<ProductStatusBadge label="Review Required" tone="warning" />);
    expect(screen.getByText("Review Required")).toHaveClass("rounded-md");
  });
});
