import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Total Cases" value={42} />);
    expect(screen.getByText("Total Cases")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders delta when provided", () => {
    render(<MetricCard label="Rate" value="94%" delta="+2%" deltaPositive />);
    expect(screen.getByText("+2%")).toBeInTheDocument();
  });
});
