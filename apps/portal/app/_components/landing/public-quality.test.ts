import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const landingDir = resolve(__dirname);
const appDir = resolve(__dirname, "../..");

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

function routeExists(href: string) {
  if (href === "/") return true;

  const route = href.split("#")[0].replace(/^\/+/, "");
  if (!route) return true;

  const routeDir = join(appDir, route);
  return existsSync(join(routeDir, "page.tsx"));
}

describe("landing: public quality", () => {
  const files = collectTsxFiles(landingDir);
  const sources = files.map((file) => ({
    file,
    content: readFileSync(file, "utf-8"),
  }));
  const combinedSource = sources.map(({ content }) => content).join("\n");

  it("does not expose placeholder or missing internal links", () => {
    const hrefs = new Set<string>();
    const linkPatterns = [
      /href="([^"]+)"/g,
      /href:\s*"([^"]+)"/g,
    ];

    for (const { content } of sources) {
      for (const pattern of linkPatterns) {
        for (const match of content.matchAll(pattern)) {
          hrefs.add(match[1]);
        }
      }
    }

    const broken = [...hrefs].filter((href) => {
      if (href === "#") return true;
      if (href.startsWith("#")) return false;
      if (href.startsWith("mailto:")) return false;
      if (/^https?:\/\//.test(href)) return false;
      return !routeExists(href);
    });

    expect(broken).toEqual([]);
  });

  it("does not point public landing CTAs at the disabled signup route", () => {
    expect(combinedSource).not.toContain("/auth/signup");
  });

  it("has a real solutions anchor target", () => {
    expect(combinedSource).toMatch(/id=(?:"solutions"|'solutions'|\{"solutions"\})/);
  });

  it("uses an Appwrite-style centered hero with the dashboard mockup below the CTAs", () => {
    const heroSource = sources.find(({ file }) =>
      file.endsWith(join("Hero", "Hero.tsx"))
    );

    expect(heroSource?.content).toContain('HeroDashboardMockup placement="below"');
    expect(heroSource?.content).not.toContain("md:grid-cols-2");
    expect(heroSource?.content).toContain("text-center");
  });

  it("does not use the old orange public landing accent system", () => {
    const oldOrangeTokens = [
      "orange-",
      "#f97316",
      "#F97316",
      "#FDBA74",
      "#EA580C",
      "249, 115, 22",
      "251, 146, 60",
      "253, 186, 116",
    ];

    for (const token of oldOrangeTokens) {
      expect(combinedSource).not.toContain(token);
    }
  });

  it("does not use emoji as integration or feature icons", () => {
    const emojiMatches = combinedSource.match(/\p{Extended_Pictographic}/gu) ?? [];
    expect(emojiMatches).toEqual([]);
  });

  it("does not use unqualified trusted-by claims on the public landing page", () => {
    expect(combinedSource).not.toMatch(/Trusted by/i);
  });

  it("does not name specific customer institutions without public case studies", () => {
    const customerNames = [
      "VDM Attorneys",
      "Werksmans",
      "ENSafrica",
      "Bowmans",
      "Cliffe Dekker",
      "Webber Wentzel",
      "Nedbank",
      "Standard Bank",
      "Absa",
      "FNB",
      "Investec",
      "Rand Merchant Bank",
    ];

    for (const name of customerNames) {
      expect(combinedSource).not.toContain(name);
    }
  });

  it("uses the shared domain icon system for bento feature tiles", () => {
    const bentoTileSources = sources.filter(({ file }) =>
      file.includes("/Bento/animations/")
    );

    for (const { file, content } of bentoTileSources) {
      if (file.endsWith("index.ts")) continue;

      expect(content).toContain("DomainIcon");
      expect(content).not.toContain("<svg");
    }
  });

  it("does not render animated metrics as zero before hydration", () => {
    const scaleSource = sources.find(({ file }) => file.endsWith("/Scale.tsx"));

    expect(scaleSource?.content).not.toMatch(
      /animate\s*\?\s*\([\s\S]*?\)\s*:\s*\(\s*"0"\s*\)/
    );
  });

  it("keeps integration labels stable on mobile", () => {
    const platformSource = sources.find(({ file }) =>
      file.endsWith("/Platforms.tsx")
    );

    expect(platformSource?.content).toContain("overflow-x-auto");
    expect(platformSource?.content).toContain("min-w-[9.5rem]");
    expect(platformSource?.content).toContain("whitespace-nowrap");
  });
});
