import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LandingPage from "./landing-page";

describe("LandingPage", () => {
  it("renders hero headline", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Property Intelligence/i)).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(<LandingPage />);
    expect(screen.getByText(/Request a Demo/i)).toBeInTheDocument();
  });
});
