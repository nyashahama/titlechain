import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CaseQueue } from "./_components/case-queue";
import { CaseIntakeForm } from "./_components/case-intake-form";
import { RecordDecisionForm } from "./_components/decision-form";
import { CaseDetail } from "./_components/case-detail";
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    render(<CaseQueue cases={cases} />);
    expect(screen.getByText("TC-000001")).toBeInTheDocument();
    expect(screen.getByText("Erf 412 Rosebank Township")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByText("ana-001")).toBeInTheDocument();
  });

  it("renders the intake form with required property fields", () => {
    render(<CaseIntakeForm actorId="ana-001" />);
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
    };

    render(<CaseDetail detail={detail} analysts={[]} actorId="ana-001" />);
    expect(screen.getByRole("heading", { name: /Audit Timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/case_created/i)).toBeInTheDocument();
  });
});
