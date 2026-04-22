"use client";

import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");
    if (!cursor || !ring) return;

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx - 4 + "px";
      cursor.style.top = my - 4 + "px";
    };

    const animateRing = () => {
      rx += (mx - rx - 16) * 0.12;
      ry += (my - ry - 16) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      rafId = requestAnimationFrame(animateRing);
    };
    rafId = requestAnimationFrame(animateRing);

    document.addEventListener("mousemove", onMouseMove);

    const interactiveEls = document.querySelectorAll(
      "a, button, .product-card"
    );
    const onEnter = () => {
      cursor.style.transform = "scale(2.5)";
      ring.style.width = "48px";
      ring.style.height = "48px";
    };
    const onLeave = () => {
      cursor.style.transform = "scale(1)";
      ring.style.width = "32px";
      ring.style.height = "32px";
    };
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const nav = document.getElementById("nav");
    const onScroll = () => {
      nav?.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll);

    const reveals = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 80);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((r) => obs.observe(r));

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="cursor-ring" id="cursorRing" />

      {/* NAV */}
      <nav id="nav">
        <div className="nav-logo">
          <span className="nav-logo-mark">TitleChain</span>
          <span className="nav-logo-tag">Beta</span>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#">Product</a>
          </li>
          <li>
            <a href="#">API Docs</a>
          </li>
          <li>
            <a href="#">Pricing</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#" className="nav-cta">
              Request Access
            </a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <span className="hero-eyebrow-text">
              Property Transaction Intelligence
            </span>
          </div>
          <h1 className="hero-title">
            The title
            <br />
            is <em>clean.</em>
            <br />
            Prove it.
          </h1>
          <p className="hero-sub">
            South Africa&apos;s first normalized, queryable, historically
            versioned property intelligence layer — built for conveyancers,
            banks, and insurers who need to know before they commit.
          </p>
          <div className="hero-actions">
            <a href="#" className="btn-primary">
              Request API Access
            </a>
            <a href="#" className="btn-ghost">
              View Documentation →
            </a>
          </div>
          <div className="hero-stat-strip">
            <div className="hero-stat">
              <div className="hero-stat-num">300k+</div>
              <div className="hero-stat-label">Transfers per year</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">R15</div>
              <div className="hero-stat-label">Per lookup from day one</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">&lt;200ms</div>
              <div className="hero-stat-label">API response time</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-right-bg" />
          <div className="api-pill">
            <div className="api-pill-label">Live API</div>
            <div className="api-pill-code">
              GET /title/<span>T12847</span> → <em>200 OK</em>
            </div>
          </div>
          <div className="deed-panel">
            <div className="deed-card">
              <div className="deed-card-header">
                <div className="deed-title-block">
                  <div className="deed-label">Deed Reference</div>
                  <div className="deed-id">T 12847/2024 — GPT</div>
                </div>
                <div className="deed-status">
                  <div className="deed-status-dot" />
                  <div className="deed-status-text">Clear</div>
                </div>
              </div>
              <div className="deed-fields">
                <div className="deed-field">
                  <div className="deed-field-label">Property Description</div>
                  <div className="deed-field-value">
                    Erf 4821, Sandton Extension 12
                  </div>
                </div>
                <div className="deed-field">
                  <div className="deed-field-label">Title Deed Number</div>
                  <div className="deed-field-value mono">T12847-2024-GP</div>
                </div>
                <div className="deed-field">
                  <div className="deed-field-label">Registered Owner</div>
                  <div className="deed-field-value">
                    Nomvula P. Dlamini (ID: ███████████)
                  </div>
                </div>
                <div className="deed-field">
                  <div className="deed-field-label">Flags &amp; Signals</div>
                  <div className="deed-flags">
                    <span className="deed-flag flag-clear">No Liens</span>
                    <span className="deed-flag flag-clear">No Disputes</span>
                    <span className="deed-flag flag-warn">Verify Bond</span>
                  </div>
                </div>
              </div>
              <div className="deed-divider" />
              <div className="deed-label">Transfer History</div>
              <div className="deed-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-event">
                      Title registered — Nomvula P. Dlamini
                    </div>
                    <div className="timeline-date">14 March 2024</div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot dim" />
                  <div className="timeline-content">
                    <div className="timeline-event">
                      Bond registered — FNB Home Loans
                    </div>
                    <div className="timeline-date">14 March 2024</div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot dim" />
                  <div className="timeline-content">
                    <div className="timeline-event">
                      Previous transfer — Bayview Prop. (Pty) Ltd
                    </div>
                    <div className="timeline-date">02 August 2019</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-track">
          <div className="marquee-item highlight">Deeds Office Integration</div>
          <div className="marquee-item">Lightstone Enrichment</div>
          <div className="marquee-item highlight">Municipal Valuations</div>
          <div className="marquee-item">FIC Fraud Signals</div>
          <div className="marquee-item highlight">Bond Registry</div>
          <div className="marquee-item">Entity Resolution</div>
          <div className="marquee-item highlight">Historical Versioning</div>
          <div className="marquee-item">POPIA Compliant</div>
          <div className="marquee-item highlight">99.9% Uptime SLA</div>
          <div className="marquee-item">REST + Webhook</div>
          {/* Duplicate for seamless loop */}
          <div className="marquee-item highlight">Deeds Office Integration</div>
          <div className="marquee-item">Lightstone Enrichment</div>
          <div className="marquee-item highlight">Municipal Valuations</div>
          <div className="marquee-item">FIC Fraud Signals</div>
          <div className="marquee-item highlight">Bond Registry</div>
          <div className="marquee-item">Entity Resolution</div>
          <div className="marquee-item highlight">Historical Versioning</div>
          <div className="marquee-item">POPIA Compliant</div>
          <div className="marquee-item highlight">99.9% Uptime SLA</div>
          <div className="marquee-item">REST + Webhook</div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="section-problem">
        <div className="reveal">
          <div className="section-label">
            <span className="section-label-num">01</span>
            <div className="section-label-line" />
            <span className="section-label-text">The Problem</span>
          </div>
          <h2 className="problem-heading">
            They fax.
            <br />
            They phone.
            <br />
            They <em>wait.</em>
          </h2>
        </div>
        <div className="problem-body reveal">
          <p className="problem-para">
            South Africa&apos;s property transfer process is one of the most
            opaque, slow, and fraud-exposed in the world. The Deeds Office
            processes over 300,000 transfers per year — but the data is publicly
            accessible only through fragmented, poorly structured channels.
          </p>
          <blockquote className="problem-quote">
            &quot;A conveyancing attorney today has no reliable API to check
            whether a title is clean, encumbered, under dispute, or flagged in
            any fraud database.&quot;
          </blockquote>
          <p className="problem-para">
            Meanwhile, title deed fraud and fraudulent bond cancellations are
            escalating. The FIC and banks have flagged this repeatedly. The
            closest incumbents — Lightstone and Propstats — are valuation tools
            aimed at estate agents, not compliance APIs built for attorneys,
            banks, and insurers.
          </p>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="section-workflow">
        <div className="workflow-inner">
          <div className="workflow-header reveal">
            <h2 className="workflow-heading">
              From raw deed
              <br />
              to <em>intelligence</em>,<br />
              in milliseconds.
            </h2>
            <p className="workflow-desc">
              We do the hard operational work of ingesting, normalizing, and
              enriching Deeds Office data so you never have to.
            </p>
          </div>
          <div className="workflow-steps reveal">
            <div className="workflow-step">
              <div className="step-number">
                <span className="step-number-text">01</span>
              </div>
              <div className="step-title">Ingest &amp; Parse</div>
              <div className="step-body">
                Continuous ingestion from Deeds Office feeds, municipal systems,
                and fraud registries. Structured where none existed.
              </div>
              <div className="step-tech">
                <span className="step-tech-tag">Go</span>
                <span className="step-tech-tag">Kafka</span>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">
                <span className="step-number-text">02</span>
              </div>
              <div className="step-title">Resolve &amp; Deduplicate</div>
              <div className="step-body">
                Rust-powered entity resolution across messy, inconsistent
                identifiers. Every property, owner, and bond linked precisely.
              </div>
              <div className="step-tech">
                <span className="step-tech-tag">Rust</span>
                <span className="step-tech-tag">PostgreSQL</span>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">
                <span className="step-number-text">03</span>
              </div>
              <div className="step-title">Enrich &amp; Score</div>
              <div className="step-body">
                Layered with Lightstone valuations, municipal data, FIC fraud
                signals, and bond registry cross-references into a risk score.
              </div>
              <div className="step-tech">
                <span className="step-tech-tag">ML Pipeline</span>
                <span className="step-tech-tag">Redis</span>
              </div>
            </div>
            <div className="workflow-step">
              <div className="step-number">
                <span className="step-number-text">04</span>
              </div>
              <div className="step-title">Serve &amp; Alert</div>
              <div className="step-body">
                REST API with &lt;200ms P99. Webhook alerts on title changes,
                encumbrances, or fraud flag updates. Attorney portal included.
              </div>
              <div className="step-tech">
                <span className="step-tech-tag">Next.js</span>
                <span className="step-tech-tag">Go API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT */}
      <section className="section-product">
        <div className="product-header reveal">
          <h2 className="product-heading">
            Three APIs.
            <br />
            One <em>source</em>
            <br />
            of truth.
          </h2>
          <p className="product-desc">
            Whether you&apos;re running compliance checks, underwriting a bond,
            or issuing title insurance — TitleChain gives every stakeholder in
            the property transaction chain a single, reliable, queryable record.
          </p>
        </div>
        <div className="product-grid reveal">
          <div className="product-card">
            <svg
              className="card-icon"
              viewBox="0 0 40 40"
              fill="none"
            >
              <rect
                x="8"
                y="4"
                width="24"
                height="32"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="14"
                y1="13"
                x2="26"
                y2="13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="14"
                y1="19"
                x2="26"
                y2="19"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="14"
                y1="25"
                x2="20"
                y2="25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="card-num">API — 01</span>
            <h3 className="card-title">Title Intelligence</h3>
            <p className="card-body">
              Complete title chain lookup. Ownership history, encumbrances,
              bond registrations, disputes, and fraud flags — versioned and
              timestamped.
            </p>
            <div className="card-endpoint">
              <span className="card-endpoint-text">
                GET /v1/title/{"{deed_number}"}
              </span>
            </div>
          </div>
          <div className="product-card">
            <svg
              className="card-icon"
              viewBox="0 0 40 40"
              fill="none"
            >
              <circle
                cx="20"
                cy="20"
                r="14"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M20 8 L20 20 L28 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="card-num">API — 02</span>
            <h3 className="card-title">Transfer Monitor</h3>
            <p className="card-body">
              Webhook-based real-time alerts on title changes, bond
              registrations, cancellations, or any flag update on properties
              you&apos;re tracking.
            </p>
            <div className="card-endpoint">
              <span className="card-endpoint-text">
                POST /v1/monitor/subscribe
              </span>
            </div>
          </div>
          <div className="product-card">
            <svg
              className="card-icon"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M8 32 L8 16 L20 8 L32 16 L32 32 Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="15"
                y="22"
                width="10"
                height="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span className="card-num">API — 03</span>
            <h3 className="card-title">Risk &amp; Fraud Score</h3>
            <p className="card-body">
              Composite risk scoring pulling from FIC flags, owner identity
              checks, anomalous transfer patterns, and municipal dispute
              registers.
            </p>
            <div className="card-endpoint">
              <span className="card-endpoint-text">
                GET /v1/risk/{"{property_id}"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section-pricing">
        <div className="pricing-inner">
          <div className="pricing-header reveal">
            <h2 className="pricing-heading">Revenue from day one.</h2>
            <p className="pricing-sub">
              Per-lookup pricing that scales with your transaction volume. No
              setup fees. No minimums.
            </p>
          </div>
          <div className="pricing-grid reveal">
            <div className="pricing-card">
              <span className="pricing-tag default">Law Firms</span>
              <div className="pricing-tier">Practitioner</div>
              <div className="pricing-price">
                R15<span>/lookup</span>
              </div>
              <p className="pricing-desc">
                For conveyancing practices doing up to 200 title checks per
                month.
              </p>
              <ul className="pricing-features">
                <li>Title Intelligence API</li>
                <li>7-year historical chain</li>
                <li>Basic fraud flags</li>
                <li>Attorney portal access</li>
                <li>Email support</li>
              </ul>
              <a href="#" className="pricing-btn default">
                Start Free Trial
              </a>
            </div>
            <div className="pricing-card featured">
              <span className="pricing-tag popular">Most Popular</span>
              <div className="pricing-tier" style={{ color: "var(--paper)" }}>
                Professional
              </div>
              <div className="pricing-price">
                R22
                <span style={{ color: "rgba(245,240,232,0.35)" }}>/lookup</span>
              </div>
              <p className="pricing-desc">
                For banks, bond originators, and high-volume conveyancers.
              </p>
              <ul className="pricing-features">
                <li>All Title Intelligence</li>
                <li>Transfer Monitor webhooks</li>
                <li>Risk &amp; Fraud Score API</li>
                <li>Full Lightstone enrichment</li>
                <li>Municipal valuation data</li>
                <li>Dedicated account manager</li>
              </ul>
              <a href="#" className="pricing-btn featured-btn">
                Request Access
              </a>
            </div>
            <div className="pricing-card">
              <span className="pricing-tag enterprise">Enterprise</span>
              <div className="pricing-tier">Insurer</div>
              <div className="pricing-price">Custom</div>
              <p className="pricing-desc">
                For title insurers, major banks, and portfolio-level risk
                management.
              </p>
              <ul className="pricing-features">
                <li>Unlimited API volume</li>
                <li>Bulk portfolio analysis</li>
                <li>Custom data enrichment</li>
                <li>On-premise deployment option</li>
                <li>SLA 99.9% + dedicated infra</li>
                <li>Compliance reporting suite</li>
              </ul>
              <a href="#" className="pricing-btn enterprise-btn">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section-trust">
        <div className="trust-grid">
          <div className="reveal">
            <div className="section-label">
              <span className="section-label-num">04</span>
              <div className="section-label-line" />
              <span className="section-label-text">The Moat</span>
            </div>
            <h2 className="trust-heading">
              The data is public.
              <br />
              The <em>intelligence</em>
              <br />
              is not.
            </h2>
            <p className="trust-body">
              Cleaning, normalizing, and enriching Deeds Office data is hard
              operational work that a well-funded competitor can&apos;t instantly
              replicate. We&apos;ve spent 18 months building the pipeline so you
              can trust the output in seconds.
            </p>
            <div className="trust-metrics">
              <div className="trust-metric">
                <div className="trust-metric-num">18M+</div>
                <div className="trust-metric-label">Properties indexed</div>
              </div>
              <div className="trust-metric">
                <div className="trust-metric-num">99.7%</div>
                <div className="trust-metric-label">
                  Entity resolution accuracy
                </div>
              </div>
              <div className="trust-metric">
                <div className="trust-metric-num">4hr</div>
                <div className="trust-metric-label">Avg. deeds update lag</div>
              </div>
              <div className="trust-metric">
                <div className="trust-metric-num">POPIA</div>
                <div className="trust-metric-label">Compliant by design</div>
              </div>
            </div>
          </div>

          <div className="stack-visual reveal">
            <div className="stack-card">
              <div className="stack-card-header">
                <div className="stack-card-title">Deed Record</div>
                <div className="stack-card-id">T8841/2019</div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Owner</div>
                <div className="sc-field-value" style={{ color: "var(--mist)" }}>
                  Bayview Properties (Pty) Ltd
                </div>
              </div>
            </div>
            <div className="stack-card">
              <div className="stack-card-header">
                <div className="stack-card-title">Deed Record</div>
                <div className="stack-card-id">T8841/2019</div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Owner</div>
                <div className="sc-field-value" style={{ color: "var(--mist)" }}>
                  Bayview Properties (Pty) Ltd
                </div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Bond</div>
                <div className="sc-field-value" style={{ color: "var(--mist)" }}>
                  Standard Bank — R2.4M
                </div>
              </div>
            </div>
            <div className="stack-card">
              <div className="stack-card-header">
                <div className="stack-card-title">TitleChain Intelligence</div>
                <div className="stack-card-id">T12847/2024</div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Current Owner</div>
                <div className="sc-field-value">Nomvula P. Dlamini</div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Transfer Chain</div>
                <div className="sc-field-value">
                  3 verified transfers · 12yr history
                </div>
              </div>
              <div className="sc-field">
                <div className="sc-field-label">Active Encumbrances</div>
                <div className="sc-field-value">
                  FNB Bond B7743 · R1.85M · Current
                </div>
              </div>
              <div className="sc-risk-row">
                <div className="sc-risk-label">Risk Score</div>
                <div className="risk-bar">
                  <div className="risk-fill" style={{ width: "18%" }} />
                </div>
                <div className="risk-value">Low</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cta">
        <div className="cta-inner reveal">
          <div
            className="section-label"
            style={{ justifyContent: "center", marginBottom: "2rem" }}
          >
            <span
              className="section-label-num"
              style={{ color: "rgba(245,240,232,0.3)" }}
            >
              →
            </span>
            <div
              className="section-label-line"
              style={{ background: "rgba(245,240,232,0.1)" }}
            />
            <span
              className="section-label-text"
              style={{ color: "rgba(245,240,232,0.3)" }}
            >
              Early Access
            </span>
          </div>
          <h2 className="cta-heading">
            Know before
            <br />
            you <em>commit.</em>
          </h2>
          <p className="cta-sub">
            Join the waitlist. We&apos;re onboarding conveyancing practices and
            banks in Q3 2025. First 50 firms get 500 free lookups.
          </p>
          <div className="cta-form">
            <input
              className="cta-input"
              type="email"
              placeholder="your@lawfirm.co.za"
            />
            <button className="cta-btn">Join Waitlist</button>
          </div>
          <p className="cta-note">No spam. Unsubscribe anytime. POPIA compliant.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">TitleChain</div>
        <p className="footer-copy">
          © 2025 TitleChain Pty Ltd · Sandton, South Africa
        </p>
        <ul className="footer-links">
          <li>
            <a href="#">Privacy</a>
          </li>
          <li>
            <a href="#">Terms</a>
          </li>
          <li>
            <a href="#">API Docs</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
      </footer>
    </>
  );
}
