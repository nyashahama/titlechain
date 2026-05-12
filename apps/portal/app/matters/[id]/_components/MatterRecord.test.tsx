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
  evidence_readiness: {
    state: "ready_for_decision",
    label: "Ready for decision",
    description: "Confirmed evidence is available and no active conflict is present.",
    confirmed_evidence_count: 1,
    evidence_count: 1,
    missing: [],
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
    expect(screen.getByRole("heading", { name: "Verification Basis" })).toBeInTheDocument();
    expect(screen.getByText("Ready for decision")).toBeInTheDocument();
    expect(screen.getByText("Confirmed evidence is available and no active conflict is present.")).toBeInTheDocument();
    expect(screen.getByText("TitleChain is using confirmed evidence for this matter.")).toBeInTheDocument();
    expect(screen.getByText("1 / 1 confirmed")).toBeInTheDocument();
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

  it("renders empty sections when the API returns null collections", () => {
    render(
      <MatterRecord
        detail={{
          ...detail,
          evidence_readiness: {
            state: "needs_evidence",
            label: "Needs evidence",
            description: "Confirm at least one evidence item before recording a decision.",
            confirmed_evidence_count: 0,
            evidence_count: 0,
            missing: ["confirmed_evidence"],
          },
          evidence: null,
          reasons: null,
          timeline: null,
        } as unknown as MatterDetail}
        onReopen={async () => undefined}
        reopening={false}
        reopenError=""
      />
    );

    expect(screen.getByRole("heading", { name: "Verification Basis" })).toBeInTheDocument();
    expect(screen.getByText("Needs evidence")).toBeInTheDocument();
    expect(screen.getByText("TitleChain is waiting for confirmed supporting evidence before relying on this matter record.")).toBeInTheDocument();
    expect(screen.getByText("No decision reasons have been published yet.")).toBeInTheDocument();
    expect(screen.getByText("No visible evidence has been attached to this matter yet.")).toBeInTheDocument();
    expect(screen.getByText("No activity has been recorded for this matter yet.")).toBeInTheDocument();
  });

  it("uses neutral verification copy when readiness is absent", () => {
    render(
      <MatterRecord
        detail={{ ...detail, evidence_readiness: undefined } as unknown as MatterDetail}
        onReopen={async () => undefined}
        reopening={false}
        reopenError=""
      />
    );

    expect(screen.getByRole("heading", { name: "Verification Basis" })).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("Evidence readiness is not available for this matter yet.")).toBeInTheDocument();
  });
});
