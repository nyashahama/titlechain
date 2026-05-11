import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative, resolve } from "path";
import { describe, expect, it } from "vitest";

const appDir = resolve(__dirname, "../..");
const customerSurfaceRoots = ["auth", "dashboard", "matters", "settings", "_components/landing"];

function collectTsxFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectTsxFiles(fullPath));
    } else if (entry.endsWith(".tsx") && !entry.includes(".test.")) {
      results.push(fullPath);
    }
  }

  return results;
}

describe("product UI quality", () => {
  const files = collectTsxFiles(appDir);
  const routePageFiles = files.filter((file) => file.endsWith("/page.tsx") && !file.includes("/_components/"));

  it("keeps customer pages independent from internal analyst components", () => {
    const customerFiles = files.filter((file) => {
      const path = relative(appDir, file);
      return path === "page.tsx" || customerSurfaceRoots.some((root) => path.startsWith(`${root}/`));
    });
    const offenders = customerFiles.filter((file) => readFileSync(file, "utf-8").includes("internal/cases/_components"));

    expect(offenders).toEqual([]);
  });

  it("keeps page-level product routes on shared icon components", () => {
    const offenders = routePageFiles.filter((file) => readFileSync(file, "utf-8").includes("<svg"));

    expect(offenders).toEqual([]);
  });

  it("keeps large rounded product cards out of route pages", () => {
    const offenders = routePageFiles.filter((file) => readFileSync(file, "utf-8").includes("rounded-2xl"));

    expect(offenders).toEqual([]);
  });
});
