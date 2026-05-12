import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SummaryExport } from "../../types";
import SummaryPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "matter-1" }),
}));

vi.mock("../../api", () => ({
  createSummary: vi.fn(async () => summaryWithNullCollections),
  getMatterDetail: vi.fn(),
}));

const summaryWithNullCollections = {
  matter: {
    summary: {
      id: "matter-1",
      case_id: "case-1",
      case_reference: "TC-001",
      customer_reference: "ACME-1",
      customer_status: "submitted",
      property_description: "Erf 412 Rosebank",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "Johannesburg",
      title_reference: "T123/2024",
      decision: "",
      submitted_at: "2026-05-01T08:00:00Z",
      updated_at: "2026-05-01T09:00:00Z",
    },
    evidence_readiness: {
      state: "needs_source_match",
      label: "Needs source match",
      description: "Link a property source and confirm supporting evidence before recording a decision.",
      confirmed_evidence_count: 0,
      evidence_count: 0,
      missing: ["source_match", "confirmed_evidence"],
    },
    evidence: null,
    reasons: null,
    timeline: null,
  },
  generated_at: "2026-05-01T10:00:00Z",
  disclaimer: "TitleChain provides verification support, not legal advice.",
} as unknown as SummaryExport;

describe("SummaryPage", () => {
  it("renders when the API returns null evidence and reasons", async () => {
    render(<SummaryPage />);

    await waitFor(() => expect(screen.getByRole("heading", { name: "Clear-to-Lodge Summary" })).toBeInTheDocument());
    expect(screen.getByText("Erf 412 Rosebank")).toBeInTheDocument();
    expect(screen.getByText("Evidence Basis")).toBeInTheDocument();
    expect(screen.getByText("Needs source match")).toBeInTheDocument();
    expect(screen.getByText("Link a property source and confirm supporting evidence before recording a decision.")).toBeInTheDocument();
    expect(screen.getByText("TitleChain is still matching this matter to a source-backed property record.")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 evidence items confirmed")).toBeInTheDocument();
    expect(screen.getByText("TitleChain provides verification support, not legal advice.")).toBeInTheDocument();
  });
});
