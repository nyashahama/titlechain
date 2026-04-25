import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Timeline } from "./timeline";

describe("Timeline", () => {
  it("renders events in order", () => {
    const events = [
      { id: "1", type: "case_created", description: "Case created", timestamp: "2026-04-24T10:00:00Z" },
      { id: "2", type: "evidence_added", description: "Evidence added", timestamp: "2026-04-24T11:00:00Z" },
    ];

    render(<Timeline events={events} />);
    expect(screen.getByText("Case created")).toBeInTheDocument();
    expect(screen.getByText("Evidence added")).toBeInTheDocument();
  });
});
