import { describe, expect, it } from "vitest";

import {
  caseStatusTone,
  decisionTone,
  evidenceTone,
  formatDuration,
  formatPercent,
  rangeLabel,
  runStatusTone,
  statusTone,
  titleize,
} from "./analytics-format";

describe("analytics formatting", () => {
  it("formats durations into compact day, hour, and minute labels", () => {
    expect(formatDuration(0)).toBe("0m");
    expect(formatDuration(59)).toBe("1m");
    expect(formatDuration(89)).toBe("1m");
    expect(formatDuration(3600)).toBe("1h");
    expect(formatDuration(90000)).toBe("1d 1h");
  });

  it("formats percentages from counts", () => {
    expect(formatPercent(3, 10)).toBe("30%");
    expect(formatPercent(3, 0)).toBe("0%");
    expect(formatPercent(3, -1)).toBe("0%");
  });

  it("returns labels for analytics ranges", () => {
    expect(rangeLabel("7d")).toBe("7 days");
    expect(rangeLabel("30d")).toBe("30 days");
    expect(rangeLabel("90d")).toBe("90 days");
    expect(rangeLabel("all")).toBe("All time");
  });

  it("maps analytics statuses to product tones", () => {
    expect(statusTone("failed")).toBe("danger");
    expect(statusTone("stop")).toBe("danger");
    expect(statusTone("closed_unresolved")).toBe("danger");
    expect(statusTone("conflicting")).toBe("danger");
    expect(statusTone("review")).toBe("warning");
    expect(statusTone("in_review")).toBe("warning");
    expect(statusTone("reopened")).toBe("warning");
    expect(statusTone("pending")).toBe("warning");
    expect(statusTone("running")).toBe("warning");
    expect(statusTone("quarantined")).toBe("warning");
    expect(statusTone("clear")).toBe("success");
    expect(statusTone("resolved")).toBe("success");
    expect(statusTone("completed")).toBe("success");
    expect(statusTone("confirmed")).toBe("success");
    expect(statusTone("unknown_status")).toBe("muted");
  });

  it("maps case statuses using case semantics", () => {
    expect(caseStatusTone("open")).toBe("info");
    expect(caseStatusTone("in_review")).toBe("warning");
    expect(caseStatusTone("resolved")).toBe("success");
    expect(caseStatusTone("closed_unresolved")).toBe("danger");
    expect(caseStatusTone("reopened")).toBe("info");
    expect(caseStatusTone("unknown_status")).toBe("muted");
  });

  it("maps decision outcomes using decision semantics", () => {
    expect(decisionTone("clear")).toBe("success");
    expect(decisionTone("review")).toBe("warning");
    expect(decisionTone("stop")).toBe("danger");
    expect(decisionTone("unknown_decision")).toBe("muted");
  });

  it("maps evidence statuses using evidence semantics", () => {
    expect(evidenceTone("captured")).toBe("info");
    expect(evidenceTone("confirmed")).toBe("success");
    expect(evidenceTone("conflicting")).toBe("danger");
    expect(evidenceTone("superseded")).toBe("muted");
    expect(evidenceTone("verified")).toBe("success");
    expect(evidenceTone("failed")).toBe("danger");
    expect(evidenceTone("unknown_status")).toBe("muted");
  });

  it("maps run statuses using run semantics", () => {
    expect(runStatusTone("pending")).toBe("warning");
    expect(runStatusTone("running")).toBe("info");
    expect(runStatusTone("completed")).toBe("success");
    expect(runStatusTone("failed")).toBe("danger");
    expect(runStatusTone("quarantined")).toBe("warning");
    expect(runStatusTone("none")).toBe("muted");
    expect(runStatusTone("unknown_status")).toBe("muted");
  });

  it("titleizes snake-case-ish analytics values", () => {
    expect(titleize("closed_unresolved")).toBe("Closed Unresolved");
    expect(titleize("clear-support")).toBe("Clear-Support");
    expect(titleize("  source record quarantined  ")).toBe("  Source Record Quarantined  ");
    expect(titleize("")).toBe("");
  });
});
