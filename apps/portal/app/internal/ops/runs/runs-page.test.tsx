import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RunList } from "./_components/run-list";

describe("runs page", () => {
  it("renders run list with type and status", () => {
    const runs = [
      {
        id: "run-1",
        run_type: "seed_property_projection",
        status: "completed",
        total_jobs: 1,
        completed_jobs: 1,
        failed_jobs: 0,
        latest_error: "",
        started_at: "2026-04-24T09:00:00Z",
        finished_at: "2026-04-24T09:01:00Z",
        created_at: "2026-04-24T09:00:00Z",
      },
    ];
    render(<RunList runs={runs} />);
    expect(screen.getByText("seed_property_projection")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});