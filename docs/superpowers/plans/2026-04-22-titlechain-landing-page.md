# TitleChain Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship an ultra-premium 2026-style TitleChain landing page in Next.js, using AIDesigner for visual direction and local code for the final implementation.

**Architecture:** Keep the route simple by rendering the homepage through [app/page.tsx](/home/nyasha-hama/dev/titlechain/app/page.tsx) and moving the landing-page composition into [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx). Store structured content in a small companion file, drive the premium look through page-scoped tokens in [app/globals.css](/home/nyasha-hama/dev/titlechain/app/globals.css), and add lightweight component tests with Vitest plus React Testing Library so the hero, CTA hierarchy, and section narrative stay locked during iteration.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 via global CSS, Vitest, React Testing Library, AIDesigner MCP + `@aidesigner/agent-skills`

---

## File Structure

- Modify: [package.json](/home/nyasha-hama/dev/titlechain/package.json)
  Add `test` and `test:watch` scripts plus Vitest-related dev dependencies.
- Modify: [tsconfig.json](/home/nyasha-hama/dev/titlechain/tsconfig.json)
  Add Vitest types so test files compile cleanly.
- Create: [vitest.config.ts](/home/nyasha-hama/dev/titlechain/vitest.config.ts)
  Configure `jsdom`, setup file loading, and path resolution for `app/*` imports.
- Create: [app/test-setup.ts](/home/nyasha-hama/dev/titlechain/app/test-setup.ts)
  Register `@testing-library/jest-dom`.
- Create: [app/page.test.tsx](/home/nyasha-hama/dev/titlechain/app/page.test.tsx)
  Lock the landing-page narrative, CTA hierarchy, and key audience sections with render tests.
- Modify: [app/page.tsx](/home/nyasha-hama/dev/titlechain/app/page.tsx)
  Reduce the route component to a clean handoff into `LandingPage`.
- Modify: [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx)
  Replace the exploratory client-side prototype with the final semantic page composition.
- Create: [app/landing-page-content.ts](/home/nyasha-hama/dev/titlechain/app/landing-page-content.ts)
  Store hero stats, credibility items, audience cards, and intelligence outputs in data arrays.
- Modify: [app/globals.css](/home/nyasha-hama/dev/titlechain/app/globals.css)
  Define the TitleChain visual system, layout rules, responsive behavior, and restrained motion.
- Generate locally, do not commit: `.aidesigner/mcp-latest.html`, `.aidesigner/runs/*`
  Persist the AIDesigner artifact, preview, and adoption output before porting.

### Task 1: Add Verification Tooling

**Files:**
- Modify: [package.json](/home/nyasha-hama/dev/titlechain/package.json)
- Modify: [tsconfig.json](/home/nyasha-hama/dev/titlechain/tsconfig.json)
- Create: [vitest.config.ts](/home/nyasha-hama/dev/titlechain/vitest.config.ts)
- Create: [app/test-setup.ts](/home/nyasha-hama/dev/titlechain/app/test-setup.ts)

- [ ] **Step 1: Install the test dependencies**

Run:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Expected: `package.json` and `package-lock.json` update with the new dev dependencies and the install exits with code `0`.

- [ ] **Step 2: Add test scripts to `package.json`**

Update the scripts block to:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Add Vitest types to `tsconfig.json`**

Set `compilerOptions.types` to:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

If `types` already exists, append `"vitest/globals"` instead of replacing the existing entries.

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 5: Create `app/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Run the test command to verify the harness is wired**

Run:

```bash
npm test
```

Expected: FAIL with a message similar to `No test files found`, which confirms the test runner is installed and executing.

- [ ] **Step 7: Commit the tooling setup**

Run:

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts app/test-setup.ts
git commit -m "test: add landing page test harness"
```

### Task 2: Capture the Visual Direction with AIDesigner

**Files:**
- Generate locally, do not commit: `.aidesigner/mcp-latest.html`
- Generate locally, do not commit: `.aidesigner/runs/*`

- [ ] **Step 1: Confirm the AIDesigner connection is live**

Use the connected MCP server:

```text
Tool: aidesigner.whoami
Tool: aidesigner.get_credit_status
```

Expected: authenticated account details and a non-error credit response.

- [ ] **Step 2: Generate the landing-page design artifact**

Use this exact prompt:

```text
Create a 2026 ultra-premium desktop landing page for TitleChain, a South African property transaction intelligence platform. The page should feel like a financial intelligence terminal with enterprise clarity and legal-finance trust. Lead with fraud and compliance risk in South African property transfers, then show TitleChain as the normalized intelligence layer on top of Deeds Office records, valuations, and fraud signals. Use an institutional palette with warm ivory and stone surfaces, deep ink text, oxidized green and muted gold accents, and restrained warning tones. Typography should feel premium and editorial, with serif headlines, clean sans body copy, and monospaced system labels. Prioritize a striking hero, intelligence-console visuals, buyer-specific use cases for conveyancers, banks, and insurers, and a strong Book demo CTA with Get API access as secondary. Avoid generic SaaS layouts, purple AI styling, dark cyberpunk, and consumer real-estate aesthetics.
```

Use this compact repo context:

```text
Next.js App Router landing page. Existing fonts already configured: Playfair Display, Instrument Sans, DM Mono. Final implementation will replace app/page.tsx and app/landing-page.tsx and port visual tokens into app/globals.css.
```

Expected: MCP returns HTML plus a remote run id.

- [ ] **Step 3: Persist the returned HTML locally**

Write the returned HTML into:

```text
.aidesigner/mcp-latest.html
```

Then run:

```bash
npx -y @aidesigner/agent-skills capture --html-file .aidesigner/mcp-latest.html --prompt "Create a 2026 ultra-premium desktop landing page for TitleChain, a South African property transaction intelligence platform. The page should feel like a financial intelligence terminal with enterprise clarity and legal-finance trust. Lead with fraud and compliance risk in South African property transfers, then show TitleChain as the normalized intelligence layer on top of Deeds Office records, valuations, and fraud signals. Use an institutional palette with warm ivory and stone surfaces, deep ink text, oxidized green and muted gold accents, and restrained warning tones. Typography should feel premium and editorial, with serif headlines, clean sans body copy, and monospaced system labels. Prioritize a striking hero, intelligence-console visuals, buyer-specific use cases for conveyancers, banks, and insurers, and a strong Book demo CTA with Get API access as secondary. Avoid generic SaaS layouts, purple AI styling, dark cyberpunk, and consumer real-estate aesthetics." --transport mcp
```

Expected: a new local run folder appears under `.aidesigner/runs/`.

- [ ] **Step 4: Generate preview and adoption output**

Run:

```bash
npx -y @aidesigner/agent-skills preview --latest
npx -y @aidesigner/agent-skills adopt --latest
```

Expected: a preview image and adoption brief are written into the latest run directory.

- [ ] **Step 5: Review the artifact and extract the implementation targets**

Check these details before coding:

```text
- hero composition and CTA treatment
- surface colors and background layering
- panel border, shadow, and radius values
- section order relative to the approved spec
- mobile stacking strategy if the artifact includes responsive hints
```

- [ ] **Step 6: Commit nothing from `.aidesigner/`**

Run:

```bash
git status --short
```

Expected: `.aidesigner/` outputs appear as untracked or modified local artifacts only and are left out of the commit set.

### Task 3: Lock the Narrative with Failing Tests

**Files:**
- Create: [app/page.test.tsx](/home/nyasha-hama/dev/titlechain/app/page.test.tsx)
- Modify: [app/page.tsx](/home/nyasha-hama/dev/titlechain/app/page.tsx)

- [ ] **Step 1: Write the failing landing-page test**

Create [app/page.test.tsx](/home/nyasha-hama/dev/titlechain/app/page.test.tsx):

```tsx
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the risk-first landing page with the required buying paths", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /see transfer risk before the title moves/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /south africa's property transfer process still runs on fragmented checks, delays, and blind spots/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /book demo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /get api access/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /built for the institutions that carry the risk/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/conveyancing attorneys/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/^banks$/i)).toBeInTheDocument();
    expect(screen.getByText(/^insurers$/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Simplify `app/page.tsx` so the route renders `LandingPage`**

Update [app/page.tsx](/home/nyasha-hama/dev/titlechain/app/page.tsx) to:

```tsx
import LandingPage from "./landing-page";

export default function Home() {
  return <LandingPage />;
}
```

- [ ] **Step 3: Run the test and verify it fails for the right reason**

Run:

```bash
npm test -- app/page.test.tsx
```

Expected: FAIL because the current [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx) does not expose the approved headline, CTA hierarchy, or section content.

- [ ] **Step 4: Commit the route handoff and failing test**

Run:

```bash
git add app/page.tsx app/page.test.tsx
git commit -m "test: lock TitleChain landing page narrative"
```

### Task 4: Implement the Page Composition and Content Model

**Files:**
- Create: [app/landing-page-content.ts](/home/nyasha-hama/dev/titlechain/app/landing-page-content.ts)
- Modify: [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx)

- [ ] **Step 1: Create the content model**

Create [app/landing-page-content.ts](/home/nyasha-hama/dev/titlechain/app/landing-page-content.ts):

```ts
export const credibilityItems = [
  "Built for conveyancers, banks, and insurers",
  "Deeds Office records, valuations, and fraud signals",
  "Historically versioned property intelligence",
];

export const heroStats = [
  { value: "300k+", label: "Transfers processed through the Deeds Office each year" },
  { value: "R15-R30", label: "Real per-lookup pricing potential for institutional workflows" },
  { value: "1", label: "Intelligence layer replacing fragmented checks, calls, and waiting" },
];

export const productLayers = [
  "Ingest fragmented deeds and adjacent property records",
  "Resolve duplicate entities and version ownership history",
  "Surface encumbrances, disputes, and bond anomalies",
  "Deliver clean answers through portal and API",
];

export const audienceCards = [
  {
    title: "Conveyancing attorneys",
    body: "Verify title cleanliness, encumbrances, disputes, and transaction readiness before instruction risk compounds.",
  },
  {
    title: "Banks",
    body: "Check collateral integrity, bond-linked anomalies, and transfer confidence before approval or payout.",
  },
  {
    title: "Insurers",
    body: "Review ownership history, valuation context, and fraud-linked signals before underwriting property exposure.",
  },
];

export const intelligenceOutputs = [
  "Title status",
  "Encumbrance history",
  "Ownership chain",
  "Bond anomaly checks",
  "Dispute indicators",
  "Valuation context",
  "Fraud-linked alerts",
];
```

- [ ] **Step 2: Replace `app/landing-page.tsx` with the semantic landing page**

Update [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx) to:

```tsx
import {
  audienceCards,
  credibilityItems,
  heroStats,
  intelligenceOutputs,
  productLayers,
} from "./landing-page-content";

export default function LandingPage() {
  return (
    <main className="titlechain-page">
      <section className="tc-hero">
        <div className="tc-hero-copy">
          <p className="tc-kicker">Rolling out for institutional property workflows</p>
          <h1>See transfer risk before the title moves.</h1>
          <p className="tc-lede">
            South Africa&apos;s property transfer process still runs on fragmented checks,
            delays, and blind spots. TitleChain is building the intelligence layer that lets
            conveyancers, banks, and insurers verify risk before they commit.
          </p>
          <div className="tc-actions">
            <a href="#final-cta" className="tc-button tc-button-primary">Book demo</a>
            <a href="#product-layer" className="tc-button tc-button-secondary">Get API access</a>
          </div>
          <ul className="tc-stat-grid">
            {heroStats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tc-hero-panel" aria-label="Transaction intelligence preview">
          <div className="tc-panel-header">
            <span className="tc-panel-label">TitleChain Signal Room</span>
            <span className="tc-panel-status">Monitoring transfer integrity</span>
          </div>
          <div className="tc-risk-callout">
            <p className="tc-risk-title">Property file: T12847/2026</p>
            <p className="tc-risk-body">Bond cancellation mismatch detected. Ownership chain and deed history require review before release.</p>
          </div>
          <ol className="tc-layer-list">
            {productLayers.map((layer) => (
              <li key={layer}>{layer}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tc-credibility" aria-label="Platform credibility">
        {credibilityItems.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>

      <section className="tc-problem">
        <p className="tc-section-label">Why now</p>
        <h2>The transfer stack is still running on blind trust.</h2>
        <p>
          Public records exist, but they arrive through fragmented and poorly structured
          channels. Today&apos;s operators still phone, fax, and wait while fraud exposure and
          compliance pressure keep rising.
        </p>
      </section>

      <section className="tc-product" id="product-layer">
        <p className="tc-section-label">Product layer</p>
        <h2>One intelligence layer for every property decision.</h2>
        <p>
          TitleChain normalizes messy property records, versions them historically, and turns
          them into decision-ready signals for legal and financial operators.
        </p>
      </section>

      <section className="tc-audiences">
        <p className="tc-section-label">Use cases</p>
        <h2>Built for the institutions that carry the risk.</h2>
        <div className="tc-card-grid">
          {audienceCards.map((card) => (
            <article key={card.title} className="tc-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tc-outputs">
        <p className="tc-section-label">Outputs</p>
        <h2>Answers you can use before you sign or payout.</h2>
        <ul className="tc-output-grid">
          {intelligenceOutputs.map((output) => (
            <li key={output}>{output}</li>
          ))}
        </ul>
      </section>

      <section className="tc-moat">
        <p className="tc-section-label">Why it wins</p>
        <h2>The moat is not access to the data. It is making the data usable.</h2>
        <p>
          The hard part is cleaning, resolving, and enriching structurally dirty property
          records into a reliable intelligence layer that firms can trust inside real workflows.
        </p>
      </section>

      <section className="tc-final-cta" id="final-cta">
        <p className="tc-section-label">Rolling out</p>
        <h2>Book a TitleChain demo before your next transfer decision goes in blind.</h2>
        <p>
          Early rollout is focused on conveyancers, banks, and insurers that need faster and
          safer transaction intelligence.
        </p>
        <div className="tc-actions">
          <a href="mailto:demo@titlechain.co.za" className="tc-button tc-button-primary">Book demo</a>
          <a href="mailto:api@titlechain.co.za" className="tc-button tc-button-secondary">Get API access</a>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Run the narrative test again**

Run:

```bash
npm test -- app/page.test.tsx
```

Expected: PASS, proving the structure and core copy now match the approved spec.

- [ ] **Step 4: Commit the content model and semantic markup**

Run:

```bash
git add app/landing-page-content.ts app/landing-page.tsx
git commit -m "feat: add TitleChain landing page structure"
```

### Task 5: Port the Premium Visual System

**Files:**
- Modify: [app/globals.css](/home/nyasha-hama/dev/titlechain/app/globals.css)
- Modify: [app/page.test.tsx](/home/nyasha-hama/dev/titlechain/app/page.test.tsx)

- [ ] **Step 1: Add a second failing test for premium visual signifiers**

Append this test to [app/page.test.tsx](/home/nyasha-hama/dev/titlechain/app/page.test.tsx):

```tsx
it("renders the signal-room visual language and final conversion section", () => {
  render(<Home />);

  expect(
    screen.getByLabelText(/transaction intelligence preview/i)
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      name: /book a titlechain demo before your next transfer decision goes in blind/i,
    })
  ).toBeInTheDocument();

  expect(screen.getByText(/the moat is not access to the data/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify the new assertion baseline**

Run:

```bash
npm test -- app/page.test.tsx
```

Expected: PASS if Task 4 was implemented exactly. If it fails, fix the markup mismatch before styling work begins.

- [ ] **Step 3: Replace the starter globals with the TitleChain token system**

Update [app/globals.css](/home/nyasha-hama/dev/titlechain/app/globals.css) to:

```css
@import "tailwindcss";

:root {
  --tc-ivory: #f4efe6;
  --tc-stone: #ded6c7;
  --tc-ink: #161815;
  --tc-graphite: #2a322d;
  --tc-panel: rgba(250, 245, 236, 0.74);
  --tc-line: rgba(34, 44, 39, 0.14);
  --tc-green: #35594a;
  --tc-gold: #a8844f;
  --tc-alert: #b96a3b;
  --background: radial-gradient(circle at top, rgba(168, 132, 79, 0.18), transparent 30%), linear-gradient(180deg, #f7f1e8 0%, #efe7db 48%, #e7ddcf 100%);
  --foreground: var(--tc-ink);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-instrument);
  --font-mono: var(--font-dm-mono);
  --font-display: var(--font-playfair);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-instrument), sans-serif;
}

.titlechain-page {
  overflow: clip;
}

.titlechain-page::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: linear-gradient(rgba(53, 89, 74, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(53, 89, 74, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at center, black 28%, transparent 88%);
  pointer-events: none;
  opacity: 0.55;
}

.tc-hero,
.tc-problem,
.tc-product,
.tc-audiences,
.tc-outputs,
.tc-moat,
.tc-final-cta {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
}

.tc-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  padding: 6rem 0 3rem;
  align-items: center;
}

.tc-kicker,
.tc-section-label,
.tc-panel-label,
.tc-panel-status,
.tc-stat-grid span,
.tc-output-grid li {
  font-family: var(--font-dm-mono), monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tc-hero h1,
.tc-problem h2,
.tc-product h2,
.tc-audiences h2,
.tc-outputs h2,
.tc-moat h2,
.tc-final-cta h2 {
  font-family: var(--font-playfair), serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.tc-hero h1 {
  max-width: 10ch;
  font-size: clamp(3.75rem, 10vw, 7rem);
  margin: 0.5rem 0 1.25rem;
}

.tc-lede,
.tc-problem p,
.tc-product p,
.tc-card p,
.tc-moat p,
.tc-final-cta p {
  max-width: 62ch;
  color: rgba(22, 24, 21, 0.78);
  font-size: 1.05rem;
  line-height: 1.75;
}

.tc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin: 2rem 0;
}

.tc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.tc-button:hover {
  transform: translateY(-1px);
}

.tc-button-primary {
  background: var(--tc-graphite);
  color: #f8f3ea;
}

.tc-button-secondary {
  border: 1px solid var(--tc-line);
  color: var(--tc-graphite);
  background: rgba(255, 255, 255, 0.42);
}

.tc-stat-grid,
.tc-output-grid,
.tc-card-grid {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tc-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.tc-stat-grid li,
.tc-card,
.tc-output-grid li,
.tc-hero-panel,
.tc-credibility p,
.tc-final-cta {
  border: 1px solid var(--tc-line);
  background: var(--tc-panel);
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 80px rgba(40, 35, 27, 0.08);
}

.tc-hero-panel,
.tc-card,
.tc-final-cta,
.tc-stat-grid li,
.tc-output-grid li {
  border-radius: 28px;
}

.tc-hero-panel {
  position: relative;
  padding: 1.5rem;
  overflow: hidden;
}

.tc-hero-panel::after {
  content: "";
  position: absolute;
  inset: auto -20% -35% 20%;
  height: 16rem;
  background: radial-gradient(circle, rgba(53, 89, 74, 0.24), transparent 68%);
  animation: panelPulse 8s ease-in-out infinite;
}

.tc-risk-callout {
  margin: 1.25rem 0;
  padding: 1rem;
  border-radius: 20px;
  background: rgba(22, 24, 21, 0.9);
  color: #f7f1e8;
}

.tc-layer-list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.85rem;
}

.tc-credibility {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding-bottom: 2rem;
}

.tc-credibility p,
.tc-card,
.tc-output-grid li {
  padding: 1.25rem;
}

.tc-problem,
.tc-product,
.tc-audiences,
.tc-outputs,
.tc-moat,
.tc-final-cta {
  padding: 2.5rem 0;
}

.tc-card-grid,
.tc-output-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.tc-final-cta {
  padding: 2rem;
  margin-bottom: 4rem;
}

@keyframes panelPulse {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.45;
  }
  50% {
    transform: translate3d(-2%, -4%, 0);
    opacity: 0.8;
  }
}

@media (max-width: 960px) {
  .tc-hero,
  .tc-credibility,
  .tc-card-grid,
  .tc-output-grid,
  .tc-stat-grid {
    grid-template-columns: 1fr;
  }

  .tc-hero {
    padding-top: 4.5rem;
  }

  .tc-hero h1 {
    max-width: 12ch;
    font-size: clamp(3rem, 16vw, 4.75rem);
  }
}
```

- [ ] **Step 4: Run all tests after the visual system port**

Run:

```bash
npm test
```

Expected: PASS with both landing-page tests green.

- [ ] **Step 5: Commit the styling pass**

Run:

```bash
git add app/globals.css app/page.test.tsx
git commit -m "feat: add TitleChain premium visual system"
```

### Task 6: Final Verification and Delivery

**Files:**
- Verify: [app/page.tsx](/home/nyasha-hama/dev/titlechain/app/page.tsx)
- Verify: [app/landing-page.tsx](/home/nyasha-hama/dev/titlechain/app/landing-page.tsx)
- Verify: [app/landing-page-content.ts](/home/nyasha-hama/dev/titlechain/app/landing-page-content.ts)
- Verify: [app/globals.css](/home/nyasha-hama/dev/titlechain/app/globals.css)

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS with Next.js generating the app successfully.

- [ ] **Step 3: Smoke-test the page locally**

Run:

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

```text
- hero headline and CTA hierarchy are immediately visible
- intelligence panel feels premium and readable
- section order matches the approved spec
- mobile layout stacks cleanly without broken cards or overflowing text
```

- [ ] **Step 4: Check the final diff**

Run:

```bash
git status --short
git diff -- app/page.tsx app/landing-page.tsx app/landing-page-content.ts app/globals.css app/page.test.tsx package.json tsconfig.json vitest.config.ts app/test-setup.ts
```

Expected: only the planned landing-page and test-tooling files appear in the final implementation diff.

- [ ] **Step 5: Commit the finished landing page**

Run:

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts app/test-setup.ts app/page.tsx app/page.test.tsx app/landing-page.tsx app/landing-page-content.ts app/globals.css
git commit -m "feat: launch TitleChain landing page"
```

## Self-Review

- Spec coverage: the plan covers the approved structure, premium visual system, AIDesigner artifact capture, CTA hierarchy, audience sections, moat section, and desktop/mobile verification.
- Placeholder scan: no `TBD`, `TODO`, or vague “implement later” instructions remain. Runtime-generated AIDesigner outputs are named by concrete local paths even though the run folder id is created by the CLI.
- Type consistency: `LandingPage`, `heroStats`, `credibilityItems`, `productLayers`, `audienceCards`, and `intelligenceOutputs` are defined once and reused consistently across the route, component, and tests.
