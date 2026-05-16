import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve, sep } from "path";

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

function landingPath(fileName: string) {
  return join(...fileName.split("/"));
}

function matchesLandingPath(file: string, fileName: string) {
  return file.endsWith(`${sep}${landingPath(fileName)}`);
}

describe("landing: public quality", () => {
  const files = collectTsxFiles(landingDir);
  const sources = files.map((file) => ({
    file,
    content: readFileSync(file, "utf-8"),
  }));
  const layoutSource = readFileSync(join(appDir, "layout.tsx"), "utf-8");
  const globalsSource = readFileSync(join(appDir, "globals.css"), "utf-8");
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
      "#fb923c",
      "#FB923C",
      "amber-",
      "rgba(249,115,22",
      "249, 115, 22",
      "251, 146, 60",
      "253, 186, 116",
    ];

    for (const token of oldOrangeTokens) {
      expect(combinedSource).not.toContain(token);
    }
  });

  it("uses Appwrite typography with balanced hero proportions", () => {
    const heroSource = sources.find(({ file }) =>
      file.endsWith(join("Hero", "Hero.tsx"))
    );
    const mockupSource = sources.find(({ file }) =>
      file.endsWith(join("Hero", "HeroDashboardMockup.tsx"))
    );

    expect(layoutSource).not.toContain('from "next/font/google"');
    expect(globalsSource).toContain("font-family:Aeonik Pro");
    expect(globalsSource).toContain("font-family:Inter");
    expect(globalsSource).toContain(
      'url("/fonts/aeonik-pro/AeonikPro-Regular.woff2")'
    );
    expect(globalsSource).toContain(
      'url("/fonts/inter/inter-latin-400-normal.woff2")'
    );
    expect(globalsSource).toContain('--font-aeonik-pro: "Aeonik Pro"');
    expect(globalsSource).toContain('--font-inter: "Inter"');
    expect(globalsSource).toContain("--font-display: var(--font-aeonik-pro)");
    expect(heroSource?.content).toContain("font-display");
    expect(heroSource?.content).toContain("font-medium");
    expect(heroSource?.content).toContain("md:pt-32");
    expect(heroSource?.content).toContain("max-w-[61rem]");
    expect(heroSource?.content).toContain("lg:text-[4.75rem]");
    expect(heroSource?.content).not.toContain("xl:text-[6.75rem]");
    expect(heroSource?.content).toContain("opacity-10");
    expect(heroSource?.content).not.toContain("opacity-80");
    expect(heroSource?.content).not.toContain("stroke-opacity='.28'");
    expect(heroSource?.content).toContain("text-white/[0.72]");
    expect(mockupSource?.content).toContain("mt-8");
    expect(mockupSource?.content).toContain("md:mt-24");
    expect(mockupSource?.content).not.toContain("mt-12");
    expect(
      existsSync(
        resolve(appDir, "../public/fonts/aeonik-pro/AeonikPro-Regular.woff2")
      )
    ).toBe(true);
    expect(
      existsSync(
        resolve(appDir, "../public/fonts/inter/inter-latin-400-normal.woff2")
      )
    ).toBe(true);
  });

  it("uses an Appwrite-style desktop navigation bar", () => {
    const navSource = sources.find(({ file }) =>
      file.endsWith(join("layout", "MainNav.tsx"))
    );

    expect(navSource?.content).toContain("h-[4.5rem]");
    expect(navSource?.content).toContain("max-w-[86.875rem]");
    expect(navSource?.content).toContain("border-b border-white/[0.08]");
    expect(navSource?.content).toContain("bg-[#151518]/95");
    expect(navSource?.content).toContain("isLight");
    expect(navSource?.content).toContain("bg-[#ededf0]/95");
    expect(navSource?.content).toContain("Products");
    expect(navSource?.content).toContain("ChevronDown");
    expect(navSource?.content).toContain("Github");
    expect(navSource?.content).toContain("Pilot");
    expect(navSource?.content).toContain("Start project");
    expect(navSource?.content).not.toContain("scrolled");
  });

  it("uses a refined Appwrite-style TitleChain logo system", () => {
    const logoSource = sources.find(({ file }) =>
      file.endsWith(join("shared", "TitlechainLogo.tsx"))
    );
    const markSource = sources.find(({ file }) =>
      file.endsWith(join("shared", "TitlechainMark.tsx"))
    );

    expect(logoSource?.content).toContain("var(--font-aeonik-pro)");
    expect(logoSource?.content).toContain(">title<");
    expect(logoSource?.content).toContain(">chain<");
    expect(logoSource?.content).toContain("wordGradientId");
    expect(logoSource?.content).not.toContain("Geist");
    expect(logoSource?.content).not.toContain('letterSpacing="-0.04em"');
    expect(markSource?.content).toContain("brandGradientId");
    expect(markSource?.content).toContain("strokeLinecap");
    expect(markSource?.content).not.toContain('transform="rotate(-45');
  });

  it("uses an Appwrite-style post-hero source and audience rail", () => {
    const platformSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Platforms.tsx")
    );
    const logoListSource = sources.find(({ file }) =>
      matchesLandingPath(file, "LogoList.tsx")
    );

    expect(platformSource?.content).toContain(
      "Optimized for the property data sources and matter systems you rely on"
    );
    expect(platformSource?.content).toContain("pt-10");
    expect(logoListSource?.content).toContain("grid-cols-2 gap-y-10");
    expect(logoListSource?.content).not.toContain(
      "rounded-xl border border-dashed"
    );
  });

  it("uses the Appwrite-style light lower band before returning to the dark CTA", () => {
    const featuresSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Features.tsx")
    );
    const mapSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Map.tsx")
    );
    const scaleSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Scale.tsx")
    );
    const pricingSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Pricing.tsx")
    );

    for (const source of [featuresSource, mapSource, scaleSource]) {
      expect(source?.content).toContain("bg-[#ededf0]");
      expect(source?.content).toContain('data-nav-theme="light"');
      expect(source?.content).toContain("text-[#1c1c20]");
      expect(source?.content).toContain("border-[#d8d8df]");
      expect(source?.content).not.toContain("text-white");
    }

    expect(pricingSource?.content).toContain("bg-[#171719]");
    expect(pricingSource?.content).toContain("text-white");
    expect(featuresSource?.content).not.toContain(
      'className="whitespace-nowrap">security and compliance'
    );
  });

  it("uses an Appwrite-style compact pricing conversion band", () => {
    const pricingSource = sources.find(({ file }) =>
      matchesLandingPath(file, "Pricing.tsx")
    );

    expect(pricingSource?.content).toContain("clip-path");
    expect(pricingSource?.content).toContain("h-[8.25rem]");
    expect(pricingSource?.content).toContain("Start building like a title team");
    expect(pricingSource?.content).toContain("Start building");
    expect(pricingSource?.content).toContain("View pricing plans");
    expect(pricingSource?.content).toContain("items-center");
    expect(pricingSource?.content).toContain("pt-[18rem]");
    expect(pricingSource?.content).toContain("pb-32");
    expect(pricingSource?.content).toContain("mt-9");
    expect(pricingSource?.content).toContain("grid-cols-3");
    expect(pricingSource?.content).toContain("divide-x");
    expect(pricingSource?.content).toContain("rounded-xl border border-white/[0.08]");
    expect(pricingSource?.content).toContain("min-h-[540px]");
    expect(pricingSource?.content).toContain("min-h-[18.75rem]");
    expect(pricingSource?.content).not.toContain("gap-6 lg:grid-cols-3");
    expect(pricingSource?.content).not.toContain("space-y-3");
    expect(pricingSource?.content).not.toContain("Check");
  });

  it("keeps the lower landing page on the Appwrite-style section system", () => {
    const headingFiles = [
      "Bento/Bento.tsx",
      "Features.tsx",
      "Map.tsx",
      "CaseStudies/CaseStudies.tsx",
      "Scale.tsx",
      "Pricing.tsx",
    ];
    const surfaceFiles = [
      "Bento/Bento.tsx",
      "Bento/animations/BondCheckTile.tsx",
      "Bento/animations/ClearToLodgeTile.tsx",
      "Bento/animations/CoverageTile.tsx",
      "Bento/animations/DeedsSearchTile.tsx",
      "Bento/animations/FraudDetectionTile.tsx",
      "Bento/animations/RiskEngineTile.tsx",
      "AiSection.tsx",
      "Map.tsx",
      "CaseStudies/CaseStudyCard.tsx",
      "Pricing.tsx",
    ];

    for (const fileName of headingFiles) {
      const source = sources.find(({ file }) =>
        matchesLandingPath(file, fileName)
      );

      expect(source?.content).toContain("font-display");
      expect(source?.content).toContain("font-medium");
    }

    for (const fileName of surfaceFiles) {
      const source = sources.find(({ file }) =>
        matchesLandingPath(file, fileName)
      );

      expect(source?.content).not.toContain("bg-[hsl(0_0%_4%)]");
      expect(source?.content).not.toContain("rounded-2xl");
      expect(source?.content).not.toContain(
        "hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)]"
      );
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
