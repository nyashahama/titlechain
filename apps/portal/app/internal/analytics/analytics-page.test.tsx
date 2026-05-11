import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import type { AnalyticsOverview } from "./types";

const overview: AnalyticsOverview = {
  range: {
    key: "30d",
    from: "2026-04-12T08:30:00Z",
    to: "2026-05-12T08:30:00Z",
  },
  operating_summary: {
    submitted_count: 24,
    resolved_count: 15,
    in_review_count: 6,
    reopened_count: 2,
    unresolved_count: 9,
    average_seconds_to_resolve: 5400,
    oldest_in_review_seconds: 172800,
    accepted_proposal_count: 11,
    manual_override_count: 3,
  },
  decision_mix: [
    {
      decision: "clear",
      count: 12,
      manual_count: 2,
      manual_override_count: 1,
      accepted_proposal_count: 8,
    },
    {
      decision: "review",
      count: 7,
      manual_count: 3,
      manual_override_count: 1,
      accepted_proposal_count: 2,
    },
    {
      decision: "stop",
      count: 5,
      manual_count: 1,
      manual_override_count: 1,
      accepted_proposal_count: 1,
    },
  ],
  reason_codes: [
    {
      code: "SOURCE_RECORD_QUARANTINED",
      label: "Source record quarantined",
      category: "review_trigger",
      count: 4,
    },
    {
      code: "TITLE_SEARCH_CLEAN",
      label: "Title search clean",
      category: "clear_support",
      count: 9,
    },
  ],
  evidence: {
    total_items: 31,
    cases_without_evidence: 3,
    cases_without_confirmed_evidence: 8,
    status_mix: [
      { status: "confirmed", count: 19 },
      { status: "captured", count: 9 },
      { status: "conflicting", count: 3 },
    ],
    source_type_mix: [
      { source_type: "deeds_office", count: 18 },
      { source_type: "manual_upload", count: 13 },
    ],
  },
  source_health: {
    latest_run_id: "run-1",
    latest_run_status: "running",
    latest_error: "",
    failed_job_count: 1,
    pending_job_count: 4,
    quarantined_record_count: 2,
    source_link_count: 42,
    last_successful_run_at: "2026-05-12T07:45:00Z",
  },
  risk_queue: [
    {
      case_id: "case-1",
      case_reference: "TC-000001",
      status: "open",
      customer_status: "review",
      organization_name: "Maseko Conveyancing",
      age_seconds: 259200,
      risk_reasons: ["conflicting_evidence", "stale_review"],
    },
  ],
};

describe("AnalyticsDashboard", () => {
  it("renders analytics sections and risk queue case links", () => {
    render(<AnalyticsDashboard overview={overview} selectedRange="30d" />);

    expect(screen.getByRole("heading", { name: /Operating summary/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Decision intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Reason intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Evidence coverage/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Source health/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Risk queue/i })).toBeInTheDocument();
    expect(screen.getByText("TC-000001")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "7 days" })).toHaveAttribute(
      "href",
      "/internal/analytics?range=7d"
    );
    expect(screen.getByRole("link", { name: "30 days" })).toHaveAttribute(
      "href",
      "/internal/analytics?range=30d"
    );
    expect(screen.getByRole("link", { name: "90 days" })).toHaveAttribute(
      "href",
      "/internal/analytics?range=90d"
    );
    expect(screen.getByRole("link", { name: "All time" })).toHaveAttribute(
      "href",
      "/internal/analytics?range=all"
    );

    const caseLink = screen.getByRole("link", { name: /Open TC-000001/i });
    expect(caseLink).toHaveAttribute("href", "/internal/cases/case-1");
  });
});
