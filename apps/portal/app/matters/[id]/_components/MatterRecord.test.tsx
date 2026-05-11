import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { MatterDetail } from "../../types";
import { MatterRecord } from "./MatterRecord";

const detail: MatterDetail = {
  summary: {
    id: "m1",
    case_id: "c1",
    case_reference: "TC-001",
    customer_reference: "ACME-1",
    customer_status: "resolved",
    property_description: "Erf 412 Rosebank",
    locality_or_area: "Rosebank",
    municipality_or_deeds_office: "Johannesburg",
    title_reference: "T123/2024",
    decision: "clear",
    submitted_at: "2026-05-01T08:00:00Z",
    updated_at: "2026-05-01T09:00:00Z",
  },
  evidence: [
    {
      type: "deeds_search",
      source_type: "registry",
      source_reference: "DR-1",
      excerpt: "Owner and title reference matched.",
      status: "verified",
    },
  ],
  reasons: [{ code: "TITLE_MATCH", label: "Title reference matches registry record" }],
  timeline: [{ type: "resolved", label: "Matter resolved", created_at: "2026-05-01T09:00:00Z" }],
};

describe("MatterRecord", () => {
  it("renders decision, reasons, evidence, and activity", () => {
    render(<MatterRecord detail={detail} onReopen={async () => undefined} reopening={false} reopenError="" />);
    expect(screen.getAllByText("Clear to Lodge")).toHaveLength(3);
    expect(screen.getByText("TITLE_MATCH")).toBeInTheDocument();
    expect(screen.getByText("Owner and title reference matched.")).toBeInTheDocument();
    expect(screen.getByText("Matter resolved")).toBeInTheDocument();
  });

  it("maps API evidence statuses to semantic product tones", () => {
    render(
      <MatterRecord
        detail={{
          ...detail,
          evidence: [
            { ...detail.evidence[0], source_reference: "DR-1", status: "captured" },
            { ...detail.evidence[0], source_reference: "DR-2", status: "confirmed" },
            { ...detail.evidence[0], source_reference: "DR-3", status: "conflicting" },
            { ...detail.evidence[0], source_reference: "DR-4", status: "superseded" },
          ],
        }}
        onReopen={async () => undefined}
        reopening={false}
        reopenError=""
      />
    );

    expect(screen.getByText("captured")).toHaveClass("text-tc-info");
    expect(screen.getByText("confirmed")).toHaveClass("text-tc-success");
    expect(screen.getByText("conflicting")).toHaveClass("text-tc-danger");
    expect(screen.getByText("superseded")).toHaveClass("text-tc-text-muted");
  });

  it("announces reopen errors", () => {
    render(
      <MatterRecord
        detail={detail}
        onReopen={async () => undefined}
        reopening={false}
        reopenError="Unable to reopen matter"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to reopen matter");
  });
});
