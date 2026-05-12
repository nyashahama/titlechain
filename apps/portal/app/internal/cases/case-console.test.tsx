import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CaseQueue } from "./_components/case-queue";
import { CaseIntakeForm } from "./_components/case-intake-form";
import { RecordDecisionForm } from "./_components/decision-form";
import { CaseDetail } from "./_components/case-detail";
import { DecisionProposalCard } from "./_components/decision-proposal-card";
import { CaseSummary, CaseDetail as CaseDetailType, ReasonCode } from "./types";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("case console", () => {
  it("renders the shared review queue with ownership and status", () => {
    const cases: CaseSummary[] = [
      {
        id: "case-1",
        case_reference: "TC-000001",
        property_description: "Erf 412 Rosebank Township",
        locality_or_area: "Rosebank",
        municipality_or_deeds_office: "Johannesburg",
        status: "open",
        assignee_id: "ana-001",
        created_by: "ana-001",
        evidence_readiness: {
          state: "needs_source_match",
          label: "Needs source match",
          description: "Link this case to a source-backed property before relying on evidence.",
          confirmed_evidence_count: 0,
          evidence_count: 0,
          has_linked_property: false,
          has_conflict: false,
          missing: ["source_match", "confirmed_evidence"],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const analystMap = new Map([["ana-001", "Nyasha Hama"]]);

    render(<CaseQueue cases={cases} analystMap={analystMap} />);
    expect(screen.getByText("TC-000001")).toBeInTheDocument();
    expect(screen.getByText("Erf 412 Rosebank Township")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Needs source match")).toBeInTheDocument();
    expect(screen.getByText("Nyasha Hama")).toBeInTheDocument();
  });

  it("renders the intake form with required property fields", () => {
    const analysts = [
      { id: "ana-001", display_name: "Nyasha Hama", email: "nyasha@titlechain.local", active: true },
    ];
    render(<CaseIntakeForm analysts={analysts} defaultActorId="ana-001" />);
    expect(screen.getByLabelText(/Property Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Locality \/ Area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Municipality \/ Deeds Office/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Case/i })).toBeInTheDocument();
  });

  it("renders the case detail decision form with reason codes", () => {
    const reasonCodes: ReasonCode[] = [
      {
        code: "TITLE_SEARCH_CLEAN",
        label: "Title search found no material blocker",
        category: "clear_support",
        is_hard_block: false,
        sort_order: 10,
      },
    ];

    render(
      <RecordDecisionForm caseId="case-1" reasonCodes={reasonCodes} actorId="ana-001" />
    );
    expect(screen.getByRole("heading", { name: /Record Decision/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Title search found no material blocker/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Evidence Exception Note/i)).toBeInTheDocument();
  });

  it("renders the audit timeline", () => {
    const detail: CaseDetailType = {
      case: {
        id: "case-1",
        case_reference: "TC-000001",
        property_description: "Erf 412 Rosebank Township",
        locality_or_area: "Rosebank",
        municipality_or_deeds_office: "Johannesburg",
        status: "open",
        assignee_id: "ana-001",
        created_by: "ana-001",
        evidence_readiness: {
          state: "needs_evidence",
          label: "Needs evidence",
          description: "Confirm at least one supporting evidence record before decisioning.",
          confirmed_evidence_count: 0,
          evidence_count: 1,
          has_linked_property: true,
          has_conflict: false,
          missing: ["confirmed_evidence"],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      matches: [],
      evidence: [],
      parties: [],
      decisions: [],
      audit_events: [
        {
          id: "aud-1",
          case_id: "case-1",
          actor_id: "ana-001",
          event_type: "case_created",
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ],
      evidence_readiness: {
        state: "needs_evidence",
        label: "Needs evidence",
        description: "Confirm at least one supporting evidence record before decisioning.",
        confirmed_evidence_count: 0,
        evidence_count: 1,
        has_linked_property: true,
        has_conflict: false,
        missing: ["confirmed_evidence"],
      },
    };
    const analystMap = new Map([["ana-001", "Nyasha Hama"]]);

    render(<CaseDetail detail={detail} analysts={[]} actorId="ana-001" analystMap={analystMap} />);
    expect(screen.getByText("Needs evidence")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Evidence checklist/i })).toBeInTheDocument();
    expect(screen.getByText("Source match")).toBeInTheDocument();
    expect(screen.getByText("Confirmed evidence")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByText(/case created/i)).toBeInTheDocument();
  });

  it("renders neutral readiness in case detail when wire data omits readiness", () => {
    const detail = {
      case: {
        id: "case-1",
        case_reference: "TC-000001",
        property_description: "Erf 412 Rosebank Township",
        locality_or_area: "Rosebank",
        municipality_or_deeds_office: "Johannesburg",
        status: "open",
        assignee_id: "ana-001",
        created_by: "ana-001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      matches: [],
      evidence: [],
      parties: [],
      decisions: [],
      audit_events: [],
    } as unknown as CaseDetailType;
    const analystMap = new Map([["ana-001", "Nyasha Hama"]]);

    expect(() =>
      render(<CaseDetail detail={detail} analysts={[]} actorId="ana-001" analystMap={analystMap} />)
    ).not.toThrow();
    expect(screen.getByText("Readiness unavailable")).toBeInTheDocument();
    const checklist = screen.getByRole("region", { name: /Evidence checklist/i });
    expect(checklist).toBeInTheDocument();
    expect(screen.getByText("Evidence readiness is not available for this case yet.")).toBeInTheDocument();
    expect(within(checklist).getAllByText("Needed")).toHaveLength(4);
    expect(within(checklist).queryByText("Complete")).not.toBeInTheDocument();
  });

  it("prefills the case intake form from a selected property", () => {
    render(
      <CaseIntakeForm
        analysts={[{ id: "ana-001", display_name: "Nyasha Hama", email: "nyasha@test", active: true }]}
        defaultActorId="ana-001"
        initialValues={{
          seed_property_id: "prop-1",
          property_description: "Erf 412 Rosebank Township",
          locality_or_area: "Rosebank",
          municipality_or_deeds_office: "Johannesburg",
          title_reference: "T12345/2024",
        }}
      />
    );
    expect(screen.getByDisplayValue("Erf 412 Rosebank Township")).toBeInTheDocument();
  });

  it("renders the current proposal with accept action", () => {
    render(
      <DecisionProposalCard
        caseId="case-1"
        proposal={{
          id: "prop-1",
          engine_version: "decision-engine-v1",
          decision: "review",
          summary: "Normalized source coverage is incomplete or conflicting.",
          reason_codes: [
            {
              code: "SOURCE_RECORD_QUARANTINED",
              label: "Source record quarantined",
              category: "review_trigger",
              is_hard_block: false,
              sort_order: 220,
            },
          ],
          explanation: { reasons: [] },
          status: "current",
          created_at: "2026-04-25T10:00:00Z",
        }}
        actorId="ana-001"
      />
    );

    expect(screen.getByText(/Normalized source coverage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Evidence Exception Note/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Accept Recommendation/i })).toBeInTheDocument();
  });
});
