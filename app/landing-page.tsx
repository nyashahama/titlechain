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
            South Africa&apos;s property transfer process still runs on fragmented
            checks, delays, and blind spots. TitleChain is building the
            intelligence layer that lets conveyancers, banks, and insurers verify
            risk before they commit.
          </p>
          <div className="tc-actions">
            <a href="#final-cta" className="tc-button tc-button-primary">
              Book demo
            </a>
            <a href="#product-layer" className="tc-button tc-button-secondary">
              Get API access
            </a>
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
            <p className="tc-risk-body">
              Bond cancellation mismatch detected. Ownership chain and deed
              history require review before release.
            </p>
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
          Public records exist, but they arrive through fragmented and poorly
          structured channels. Today&apos;s operators still phone, fax, and wait while
          fraud exposure and compliance pressure keep rising.
        </p>
      </section>

      <section className="tc-product" id="product-layer">
        <p className="tc-section-label">Product layer</p>
        <h2>One intelligence layer for every property decision.</h2>
        <p>
          TitleChain normalizes messy property records, versions them
          historically, and turns them into decision-ready signals for legal and
          financial operators.
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

      <section className="tc-outputs" id="outputs">
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
          The hard part is cleaning, resolving, and enriching structurally dirty
          property records into a reliable intelligence layer that firms can trust
          inside real workflows.
        </p>
      </section>

      <section className="tc-final-cta" id="final-cta">
        <p className="tc-section-label">Rolling out</p>
        <h2>
          Book a TitleChain demo before your next transfer decision goes in blind.
        </h2>
        <p>
          Early rollout is focused on conveyancers, banks, and insurers that need
          faster and safer transaction intelligence.
        </p>
        <div className="tc-actions">
          <a
            href="mailto:demo@titlechain.co.za"
            className="tc-button tc-button-primary"
          >
            Book demo
          </a>
          <a
            href="mailto:api@titlechain.co.za"
            className="tc-button tc-button-secondary"
          >
            Get API access
          </a>
        </div>
      </section>
    </main>
  );
}
