import { describe, expect, it } from "vitest";
import { evidenceReadinessAction } from "./evidence-readiness";

describe("evidenceReadinessAction", () => {
  it("uses neutral copy for unknown states", () => {
    const action = evidenceReadinessAction("unknown");

    expect(action).toBe("Evidence readiness is not available for this matter yet.");
    expect(action).not.toContain("confirmed evidence");
  });

  it("only claims confirmed evidence for explicit ready states", () => {
    expect(evidenceReadinessAction("ready_for_decision")).toBe("TitleChain is using confirmed evidence for this matter.");
    expect(evidenceReadinessAction("ready")).toBe("TitleChain is using confirmed evidence for this matter.");
  });
});
