import { describe, expect, it } from "vitest";
import {
  getVisibleProductNavigation,
  productNavigation,
  resolveActiveProductRoute,
} from "./navigation";

describe("product navigation", () => {
  it("groups workspace and operations links", () => {
    expect(productNavigation.map((group) => group.label)).toEqual([
      "Workspace",
      "Operations",
    ]);
  });

  it("hides operations links for non-admin users", () => {
    const visible = getVisibleProductNavigation("pilot_user");
    expect(visible.flatMap((group) => group.items.map((item) => item.href))).toEqual([
      "/dashboard",
      "/matters",
      "/matters/new",
      "/settings",
    ]);
  });

  it("shows operations links for pilot admins", () => {
    const visible = getVisibleProductNavigation("pilot_admin");
    expect(visible.flatMap((group) => group.items.map((item) => item.href))).toContain(
      "/internal/cases"
    );
    expect(visible.flatMap((group) => group.items.map((item) => item.href))).toContain(
      "/internal/analytics"
    );
  });

  it("resolves nested routes to their parent nav item", () => {
    expect(resolveActiveProductRoute("/matters/matter-123")).toBe("/matters");
    expect(resolveActiveProductRoute("/internal/cases/case-123")).toBe("/internal/cases");
    expect(resolveActiveProductRoute("/internal/analytics/evidence")).toBe("/internal/analytics");
  });
});
