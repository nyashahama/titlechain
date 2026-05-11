import { describe, expect, it } from "vitest";
import {
  getCaseStatusMeta,
  getDecisionMeta,
  getEvidenceStatusMeta,
  getMatterStatusMeta,
  getRunStatusMeta,
} from "./status";

describe("product status metadata", () => {
  it("maps matter states to semantic labels", () => {
    expect(getMatterStatusMeta("submitted")).toMatchObject({
      label: "Submitted",
      tone: "info",
    });
    expect(getMatterStatusMeta("resolved")).toMatchObject({
      label: "Resolved",
      tone: "success",
    });
  });

  it("maps clear-to-lodge decisions", () => {
    expect(getDecisionMeta("clear")).toMatchObject({
      label: "Clear to Lodge",
      tone: "success",
    });
    expect(getDecisionMeta("stop")).toMatchObject({
      label: "Stop",
      tone: "danger",
    });
    expect(getDecisionMeta("")).toMatchObject({
      label: "Pending",
      tone: "muted",
    });
  });

  it("maps run status", () => {
    expect(getRunStatusMeta("failed")).toMatchObject({
      label: "Failed",
      tone: "danger",
    });
  });

  it("maps internal case and evidence statuses", () => {
    expect(getCaseStatusMeta("closed_unresolved")).toMatchObject({
      label: "Unresolved",
      tone: "danger",
    });
    expect(getEvidenceStatusMeta("conflicting")).toMatchObject({
      label: "Conflicting",
      tone: "danger",
    });
  });
});
