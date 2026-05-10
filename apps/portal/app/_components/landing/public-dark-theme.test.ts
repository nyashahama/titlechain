import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

function collectTsxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (entry === "node_modules" || entry === ".next") continue;
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectTsxFiles(fullPath));
    } else if (entry.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("landing: dark theme only", () => {
  const landingDir = resolve(__dirname);
  const files = collectTsxFiles(landingDir);

  const forbiddenClasses = [
    "bg-white",
    "text-gray-100",
    "text-gray-200",
    "text-gray-300",
    "text-gray-400",
    "text-gray-500",
    "text-gray-600",
    "text-gray-700",
    "text-gray-800",
    "text-gray-900",
  ];

  it("landing components should not use light theme classes", () => {
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      for (const cls of forbiddenClasses) {
        expect(content).not.toContain(`"${cls}"`);
        expect(content).not.toContain(`'${cls}'`);
      }
    }
  });
});
