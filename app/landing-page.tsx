"use client";

import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const cursor = document.getElementById("cursor");
    const ring = document.getElementById("cursorRing");
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
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

    const interactiveEls = document.querySelectorAll("a, button, .product-card");
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
      if (!nav) return;
      if (window.scrollY > 40) {
        nav.style.backgroundColor = "rgba(245,240,232,0.92)";
        nav.style.backdropFilter = "blur(12px)";
        nav.classList.remove("border-transparent");
        nav.classList.add("border-border");
      } else {
        nav.style.backgroundColor = "";
        nav.style.backdropFilter = "";
        nav.classList.remove("border-border");
        nav.classList.add("border-transparent");
      }
    };
    window.addEventListener("scroll", onScroll);

    const reveals = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => {
              const el = e.target as HTMLElement;
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, i * 80);
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
      {/* Custom Cursor */}
      <div className="fixed w-2 h-2 bg-rust rounded-full pointer-events-none mix-blend-multiply z-[9999] transition-transform duration-100" id="cursor" />
      <div className="fixed w-8 h-8 border border-rust rounded-full pointer-events-none mix-blend-multiply z-[9998] transition-all duration-[250ms]" id="cursorRing" />

      {/* NAV */}
      <nav id="nav" className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-6 border-b border-transparent transition-all duration-300">
        <div className="flex items-baseline gap-2">
          <span className="font-serif font-black text-[1.1rem] tracking-[-0.02em] text-ink">TitleChain</span>
          <span className="font-mono text-[0.6rem] text-rust tracking-[0.12em] uppercase border border-rust px-[6px] py-[2px] rounded-[2px]">Beta</span>
        </div>
        <ul className="flex items-center gap-10 list-none">
          <li><a href="#" className="font-sans text-[0.82rem] font-medium tracking-[0.04em] text-slate no-underline uppercase transition-colors duration-200 hover:text-rust">Product</a></li>
          <li><a href="#" className="font-sans text-[0.82rem] font-medium tracking-[0.04em] text-slate no-underline uppercase transition-colors duration-200 hover:text-rust">API Docs</a></li>
          <li><a href="#" className="font-sans text-[0.82rem] font-medium tracking-[0.04em] text-slate no-underline uppercase transition-colors duration-200 hover:text-rust">Pricing</a></li>
          <li><a href="#" className="font-sans text-[0.82rem] font-medium tracking-[0.04em] text-slate no-underline uppercase transition-colors duration-200 hover:text-rust">About</a></li>
          <li><a href="#" className="bg-ink text-paper font-sans text-[0.82rem] font-medium tracking-[0.04em] no-underline uppercase px-5 py-[0.6rem] rounded-[2px] transition-colors duration-200 hover:bg-rust">Request Access</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="min-h-screen grid grid-cols-2 relative overflow-hidden">
        <div className="flex flex-col justify-end pt-32 pr-16 pb-20 pl-12 relative">
          <div className="flex items-center gap-4 mb-8 opacity-0 animate-[fadeUp_0.8s_ease_0.2s_forwards]">
            <div className="w-10 h-px bg-rust" />
            <span className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-rust">Property Transaction Intelligence</span>
          </div>
          <h1 className="font-serif text-[clamp(3.5rem,6vw,6.5rem)] font-black leading-[0.92] tracking-[-0.03em] text-ink mb-8 opacity-0 animate-[fadeUp_0.8s_ease_0.4s_forwards]">
            The title<br />is <em className="italic text-rust">clean.</em><br />Prove it.
          </h1>
          <p className="font-sans text-base leading-[1.7] text-slate max-w-[420px] mb-12 font-light opacity-0 animate-[fadeUp_0.8s_ease_0.6s_forwards]">
            South Africa&apos;s first normalized, queryable, historically versioned property intelligence layer — built for conveyancers, banks, and insurers who need to know before they commit.
          </p>
          <div className="flex items-center gap-6 opacity-0 animate-[fadeUp_0.8s_ease_0.8s_forwards]">
            <a href="#" className="bg-ink text-paper font-sans text-[0.82rem] font-semibold tracking-[0.08em] uppercase no-underline px-[2.2rem] py-4 rounded-[2px] border-none cursor-none transition-all duration-200 inline-block hover:bg-rust hover:-translate-y-px">Request API Access</a>
            <a href="#" className="font-mono text-[0.78rem] tracking-[0.1em] text-slate no-underline flex items-center gap-2 border-b border-border pb-0.5 transition-colors duration-200 hover:text-rust hover:border-rust">View Documentation →</a>
          </div>
          <div className="flex gap-8 mt-16 pt-8 border-t border-border opacity-0 animate-[fadeUp_0.8s_ease_1s_forwards]">
            <div className="flex-1">
              <div className="font-serif text-[1.8rem] font-bold text-ink leading-none">300k+</div>
              <div className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-mist mt-1">Transfers per year</div>
            </div>
            <div className="flex-1">
              <div className="font-serif text-[1.8rem] font-bold text-ink leading-none">R15</div>
              <div className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-mist mt-1">Per lookup from day one</div>
            </div>
            <div className="flex-1">
              <div className="font-serif text-[1.8rem] font-bold text-ink leading-none">&lt;200ms</div>
              <div className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-mist mt-1">API response time</div>
            </div>
          </div>
        </div>

        <div className="relative bg-slate overflow-hidden opacity-0 animate-[fadeIn_1s_ease_0.3s_forwards]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(184,149,58,0.15)_0%,transparent_60%),radial-gradient(ellipse_at_20%_80%,rgba(200,75,47,0.12)_0%,transparent_50%)]" />
          <div className="absolute top-8 right-8 bg-[rgba(10,10,10,0.6)] border border-[rgba(184,149,58,0.3)] rounded-[3px] px-4 py-3 backdrop-blur-md animate-[float_4s_ease-in-out_infinite]">
            <div className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-gold mb-[6px]">Live API</div>
            <div className="font-mono text-[0.72rem] text-[rgba(245,240,232,0.7)]">GET /title/<span className="text-[#7dd3fc]">T12847</span> → <em className="text-[#86efac] not-italic">200 OK</em></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="bg-[rgba(245,240,232,0.04)] border border-[rgba(245,240,232,0.1)] rounded p-8 w-full max-w-[420px] backdrop-blur relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(245,240,232,0.08)]">
                <div>
                  <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(245,240,232,0.4)] mb-1">Deed Reference</div>
                  <div className="font-mono text-[0.85rem] text-gold-light">T 12847/2024 — GPT</div>
                </div>
                <div className="flex items-center gap-[0.4rem] bg-[rgba(50,200,100,0.1)] border border-[rgba(50,200,100,0.25)] px-3 py-[0.3rem] rounded-full">
                  <div className="w-[6px] h-[6px] bg-[#4ade80] rounded-full animate-[pulse_2s_ease_infinite]" />
                  <div className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-[#4ade80]">Clear</div>
                </div>
              </div>
              <div className="grid gap-4 mb-6">
                <div>
                  <div className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-[rgba(245,240,232,0.35)] mb-[3px]">Property Description</div>
                  <div className="font-sans text-[0.88rem] text-[rgba(245,240,232,0.85)] font-normal">Erf 4821, Sandton Extension 12</div>
                </div>
                <div>
                  <div className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-[rgba(245,240,232,0.35)] mb-[3px]">Title Deed Number</div>
                  <div className="font-mono text-[0.8rem] text-gold">T12847-2024-GP</div>
                </div>
                <div>
                  <div className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-[rgba(245,240,232,0.35)] mb-[3px]">Registered Owner</div>
                  <div className="font-sans text-[0.88rem] text-[rgba(245,240,232,0.85)] font-normal">Nomvula P. Dlamini (ID: ███████████)</div>
                </div>
                <div>
                  <div className="font-mono text-[0.58rem] tracking-[0.16em] uppercase text-[rgba(245,240,232,0.35)] mb-[3px]">Flags &amp; Signals</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="font-mono text-[0.6rem] tracking-[0.1em] px-[0.6rem] py-1 rounded-[2px] uppercase bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ade80]">No Liens</span>
                    <span className="font-mono text-[0.6rem] tracking-[0.1em] px-[0.6rem] py-1 rounded-[2px] uppercase bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ade80]">No Disputes</span>
                    <span className="font-mono text-[0.6rem] tracking-[0.1em] px-[0.6rem] py-1 rounded-[2px] uppercase bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] text-[#fbbf24]">Verify Bond</span>
                  </div>
                </div>
              </div>
              <div className="h-px bg-[rgba(245,240,232,0.06)] my-6" />
              <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(245,240,232,0.4)] mb-1">Transfer History</div>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-[6px] h-[6px] rounded-full bg-gold mt-[5px] flex-shrink-0" />
                  <div>
                    <div className="font-sans text-[0.78rem] text-[rgba(245,240,232,0.7)] leading-[1.3]">Title registered — Nomvula P. Dlamini</div>
                    <div className="font-mono text-[0.6rem] text-[rgba(245,240,232,0.3)] mt-0.5">14 March 2024</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-[6px] h-[6px] rounded-full bg-[rgba(245,240,232,0.2)] mt-[5px] flex-shrink-0" />
                  <div>
                    <div className="font-sans text-[0.78rem] text-[rgba(245,240,232,0.7)] leading-[1.3]">Bond registered — FNB Home Loans</div>
                    <div className="font-mono text-[0.6rem] text-[rgba(245,240,232,0.3)] mt-0.5">14 March 2024</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-[6px] h-[6px] rounded-full bg-[rgba(245,240,232,0.2)] mt-[5px] flex-shrink-0" />
                  <div>
                    <div className="font-sans text-[0.78rem] text-[rgba(245,240,232,0.7)] leading-[1.3]">Previous transfer — Bayview Prop. (Pty) Ltd</div>
                    <div className="font-mono text-[0.6rem] text-[rgba(245,240,232,0.3)] mt-0.5">02 August 2019</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-ink py-[0.9rem] overflow-hidden border-t border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex gap-12 animate-[marquee_30s_linear_infinite] w-max">
          {[
            ["Deeds Office Integration", true],
            ["Lightstone Enrichment", false],
            ["Municipal Valuations", true],
            ["FIC Fraud Signals", false],
            ["Bond Registry", true],
            ["Entity Resolution", false],
            ["Historical Versioning", true],
            ["POPIA Compliant", false],
            ["99.9% Uptime SLA", true],
            ["REST + Webhook", false],
          ].map(([text, highlight], i) => (
            <div key={i} className={`flex items-center gap-4 font-mono text-[0.68rem] tracking-[0.18em] uppercase whitespace-nowrap ${highlight ? "text-gold" : "text-[rgba(245,240,232,0.35)]"}`}>
              {text}
              <span className="text-rust text-xl">·</span>
            </div>
          ))}
          {[
            ["Deeds Office Integration", true],
            ["Lightstone Enrichment", false],
            ["Municipal Valuations", true],
            ["FIC Fraud Signals", false],
            ["Bond Registry", true],
            ["Entity Resolution", false],
            ["Historical Versioning", true],
            ["POPIA Compliant", false],
            ["99.9% Uptime SLA", true],
            ["REST + Webhook", false],
          ].map(([text, highlight], i) => (
            <div key={`dup-${i}`} className={`flex items-center gap-4 font-mono text-[0.68rem] tracking-[0.18em] uppercase whitespace-nowrap ${highlight ? "text-gold" : "text-[rgba(245,240,232,0.35)]"}`}>
              {text}
              <span className="text-rust text-xl">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section className="grid grid-cols-2 gap-24 max-w-[1400px] mx-auto py-32 px-12">
        <div className="reveal opacity-0 translate-y-8 transition-all duration-700">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[0.65rem] text-rust tracking-[0.1em]">01</span>
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-mist">The Problem</span>
          </div>
          <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            They fax.<br />They phone.<br />They <em className="italic text-rust">wait.</em>
          </h2>
        </div>
        <div className="flex flex-col justify-center gap-8 reveal opacity-0 translate-y-8 transition-all duration-700">
          <p className="font-sans text-[0.95rem] leading-[1.8] text-slate font-light">
            South Africa&apos;s property transfer process is one of the most opaque, slow, and fraud-exposed in the world. The Deeds Office processes over 300,000 transfers per year — but the data is publicly accessible only through fragmented, poorly structured channels.
          </p>
          <blockquote className="border-l-2 border-rust pl-6 font-serif text-[1.2rem] italic text-ink leading-[1.5]">
            &quot;A conveyancing attorney today has no reliable API to check whether a title is clean, encumbered, under dispute, or flagged in any fraud database.&quot;
          </blockquote>
          <p className="font-sans text-[0.95rem] leading-[1.8] text-slate font-light">
            Meanwhile, title deed fraud and fraudulent bond cancellations are escalating. The FIC and banks have flagged this repeatedly. The closest incumbents — Lightstone and Propstats — are valuation tools aimed at estate agents, not compliance APIs built for attorneys, banks, and insurers.
          </p>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="relative overflow-hidden bg-ink py-32 px-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-[18vw] font-black text-white/[0.02] whitespace-nowrap pointer-events-none tracking-[-0.05em] select-none">WORKFLOW</div>
        <div className="max-w-[1400px] mx-auto relative">
          <div className="flex items-end justify-between mb-20 reveal opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="font-serif text-[clamp(2rem,3vw,3.2rem)] font-bold leading-[1.1] text-paper max-w-[500px]">
              From raw deed<br />to <em className="italic text-gold-light">intelligence</em>,<br />in milliseconds.
            </h2>
            <p className="font-sans text-[0.9rem] leading-[1.7] text-[rgba(245,240,232,0.45)] max-w-[320px] font-light text-right">
              We do the hard operational work of ingesting, normalizing, and enriching Deeds Office data so you never have to.
            </p>
          </div>
          <div className="relative reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-gold to-gold/30" />
            <div className="grid grid-cols-4 gap-0">
              <div className="pr-8 relative">
                <div className="w-16 h-16 rounded-full border border-[rgba(184,149,58,0.3)] flex items-center justify-center mb-8 relative bg-ink">
                  <span className="font-mono text-[0.75rem] tracking-[0.1em] text-gold">01</span>
                </div>
                <div className="font-serif text-[1.2rem] font-bold text-paper mb-3 leading-[1.2]">Ingest &amp; Parse</div>
                <div className="font-sans text-[0.82rem] leading-[1.7] text-[rgba(245,240,232,0.4)] font-light">Continuous ingestion from Deeds Office feeds, municipal systems, and fraud registries. Structured where none existed.</div>
                <div className="flex gap-[0.4rem] flex-wrap mt-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Go</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Kafka</span>
                </div>
              </div>
              <div className="pr-8 relative">
                <div className="w-16 h-16 rounded-full border border-[rgba(184,149,58,0.3)] flex items-center justify-center mb-8 relative bg-ink">
                  <span className="font-mono text-[0.75rem] tracking-[0.1em] text-gold">02</span>
                </div>
                <div className="font-serif text-[1.2rem] font-bold text-paper mb-3 leading-[1.2]">Resolve &amp; Deduplicate</div>
                <div className="font-sans text-[0.82rem] leading-[1.7] text-[rgba(245,240,232,0.4)] font-light">Rust-powered entity resolution across messy, inconsistent identifiers. Every property, owner, and bond linked precisely.</div>
                <div className="flex gap-[0.4rem] flex-wrap mt-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Rust</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">PostgreSQL</span>
                </div>
              </div>
              <div className="pr-8 relative">
                <div className="w-16 h-16 rounded-full border border-[rgba(184,149,58,0.3)] flex items-center justify-center mb-8 relative bg-ink">
                  <span className="font-mono text-[0.75rem] tracking-[0.1em] text-gold">03</span>
                </div>
                <div className="font-serif text-[1.2rem] font-bold text-paper mb-3 leading-[1.2]">Enrich &amp; Score</div>
                <div className="font-sans text-[0.82rem] leading-[1.7] text-[rgba(245,240,232,0.4)] font-light">Layered with Lightstone valuations, municipal data, FIC fraud signals, and bond registry cross-references into a risk score.</div>
                <div className="flex gap-[0.4rem] flex-wrap mt-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">ML Pipeline</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Redis</span>
                </div>
              </div>
              <div className="pr-8 relative">
                <div className="w-16 h-16 rounded-full border border-[rgba(184,149,58,0.3)] flex items-center justify-center mb-8 relative bg-ink">
                  <span className="font-mono text-[0.75rem] tracking-[0.1em] text-gold">04</span>
                </div>
                <div className="font-serif text-[1.2rem] font-bold text-paper mb-3 leading-[1.2]">Serve &amp; Alert</div>
                <div className="font-sans text-[0.82rem] leading-[1.7] text-[rgba(245,240,232,0.4)] font-light">REST API with &lt;200ms P99. Webhook alerts on title changes, encumbrances, or fraud flag updates. Attorney portal included.</div>
                <div className="flex gap-[0.4rem] flex-wrap mt-4">
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Next.js</span>
                  <span className="font-mono text-[0.6rem] tracking-[0.1em] px-2 py-[3px] border border-[rgba(184,149,58,0.2)] text-[rgba(184,149,58,0.6)] rounded-[2px] uppercase">Go API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT */}
      <section className="max-w-[1400px] mx-auto py-32 px-12">
        <div className="grid grid-cols-2 gap-16 mb-20 items-end reveal opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Three APIs.<br />One <em className="italic text-rust">source</em><br />of truth.
          </h2>
          <p className="font-sans text-[0.95rem] leading-[1.8] text-slate font-light">
            Whether you&apos;re running compliance checks, underwriting a bond, or issuing title insurance — TitleChain gives every stakeholder in the property transaction chain a single, reliable, queryable record.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-border border border-border reveal opacity-0 translate-y-8 transition-all duration-700">
          <div className="group relative bg-paper p-10 transition-colors duration-300 hover:bg-aged overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            <svg className="w-10 h-10 mb-6 opacity-70" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="4" width="24" height="32" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="13" x2="26" y2="13" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="19" x2="26" y2="19" stroke="currentColor" strokeWidth="1.5" />
              <line x1="14" y1="25" x2="20" y2="25" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-rust mb-3 block">API — 01</span>
            <h3 className="font-serif text-[1.3rem] font-bold text-ink mb-3 leading-[1.2]">Title Intelligence</h3>
            <p className="font-sans text-[0.85rem] leading-[1.7] text-slate font-light">Complete title chain lookup. Ownership history, encumbrances, bond registrations, disputes, and fraud flags — versioned and timestamped.</p>
            <div className="mt-6 bg-ink rounded-[2px] px-4 py-3">
              <span className="font-mono text-[0.68rem] text-gold tracking-[0.05em]">GET /v1/title/{"{deed_number}"}</span>
            </div>
          </div>
          <div className="group relative bg-paper p-10 transition-colors duration-300 hover:bg-aged overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            <svg className="w-10 h-10 mb-6 opacity-70" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 8 L20 20 L28 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-rust mb-3 block">API — 02</span>
            <h3 className="font-serif text-[1.3rem] font-bold text-ink mb-3 leading-[1.2]">Transfer Monitor</h3>
            <p className="font-sans text-[0.85rem] leading-[1.7] text-slate font-light">Webhook-based real-time alerts on title changes, bond registrations, cancellations, or any flag update on properties you&apos;re tracking.</p>
            <div className="mt-6 bg-ink rounded-[2px] px-4 py-3">
              <span className="font-mono text-[0.68rem] text-gold tracking-[0.05em]">POST /v1/monitor/subscribe</span>
            </div>
          </div>
          <div className="group relative bg-paper p-10 transition-colors duration-300 hover:bg-aged overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rust origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            <svg className="w-10 h-10 mb-6 opacity-70" viewBox="0 0 40 40" fill="none">
              <path d="M8 32 L8 16 L20 8 L32 16 L32 32 Z" stroke="currentColor" strokeWidth="1.5" />
              <rect x="15" y="22" width="10" height="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-mono text-[0.6rem] tracking-[0.2em] text-rust mb-3 block">API — 03</span>
            <h3 className="font-serif text-[1.3rem] font-bold text-ink mb-3 leading-[1.2]">Risk &amp; Fraud Score</h3>
            <p className="font-sans text-[0.85rem] leading-[1.7] text-slate font-light">Composite risk scoring pulling from FIC flags, owner identity checks, anomalous transfer patterns, and municipal dispute registers.</p>
            <div className="mt-6 bg-ink rounded-[2px] px-4 py-3">
              <span className="font-mono text-[0.68rem] text-gold tracking-[0.05em]">GET /v1/risk/{"{property_id}"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-aged py-32 px-12 border-t border-b border-border">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 reveal opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="font-serif text-[clamp(2rem,3vw,3rem)] font-bold tracking-[-0.02em] mb-4">Revenue from day one.</h2>
            <p className="font-sans text-[0.95rem] text-slate font-light">Per-lookup pricing that scales with your transaction volume. No setup fees. No minimums.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="bg-paper border border-border p-12 relative rounded-[2px]">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase px-[10px] py-[3px] rounded-full inline-block mb-6 bg-aged text-slate">Law Firms</span>
              <div className="font-serif text-[1.4rem] font-bold text-ink mb-1">Practitioner</div>
              <div className="font-mono text-[2.5rem] font-medium text-ink leading-none my-4">R15<span className="text-[1rem] text-mist">/lookup</span></div>
              <p className="font-sans text-[0.82rem] leading-[1.6] text-slate font-light mb-8">For conveyancing practices doing up to 200 title checks per month.</p>
              <ul className="list-none grid gap-3 mb-10">
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Title Intelligence API</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>7-year historical chain</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Basic fraud flags</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Attorney portal access</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Email support</li>
              </ul>
              <a href="#" className="block text-center no-underline font-sans text-[0.8rem] font-semibold tracking-[0.08em] uppercase px-[0.9rem] py-[0.9rem] rounded-[2px] transition-colors duration-200 bg-ink text-paper hover:bg-rust">Start Free Trial</a>
            </div>
            <div className="bg-ink border border-ink p-12 relative rounded-[2px]">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase px-[10px] py-[3px] rounded-full inline-block mb-6 bg-rust text-paper">Most Popular</span>
              <div className="font-serif text-[1.4rem] font-bold text-paper mb-1">Professional</div>
              <div className="font-mono text-[2.5rem] font-medium text-gold-light leading-none my-4">R22<span className="text-[1rem] text-[rgba(245,240,232,0.35)]">/lookup</span></div>
              <p className="font-sans text-[0.82rem] leading-[1.6] text-[rgba(245,240,232,0.5)] font-light mb-8">For banks, bond originators, and high-volume conveyancers.</p>
              <ul className="list-none grid gap-3 mb-10">
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>All Title Intelligence</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>Transfer Monitor webhooks</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>Risk &amp; Fraud Score API</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>Full Lightstone enrichment</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>Municipal valuation data</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-[rgba(245,240,232,0.65)] font-light"><span className="text-gold text-[0.8rem] flex-shrink-0 mt-px">→</span>Dedicated account manager</li>
              </ul>
              <a href="#" className="block text-center no-underline font-sans text-[0.8rem] font-semibold tracking-[0.08em] uppercase px-[0.9rem] py-[0.9rem] rounded-[2px] transition-colors duration-200 bg-gold text-ink hover:bg-gold-light">Request Access</a>
            </div>
            <div className="bg-paper border border-border p-12 relative rounded-[2px]">
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase px-[10px] py-[3px] rounded-full inline-block mb-6 bg-gold text-ink">Enterprise</span>
              <div className="font-serif text-[1.4rem] font-bold text-ink mb-1">Insurer</div>
              <div className="font-mono text-[2.5rem] font-medium text-ink leading-none my-4">Custom</div>
              <p className="font-sans text-[0.82rem] leading-[1.6] text-slate font-light mb-8">For title insurers, major banks, and portfolio-level risk management.</p>
              <ul className="list-none grid gap-3 mb-10">
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Unlimited API volume</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Bulk portfolio analysis</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Custom data enrichment</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>On-premise deployment option</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>SLA 99.9% + dedicated infra</li>
                <li className="flex items-start gap-3 font-sans text-[0.83rem] text-slate font-light"><span className="text-rust text-[0.8rem] flex-shrink-0 mt-px">→</span>Compliance reporting suite</li>
              </ul>
              <a href="#" className="block text-center no-underline font-sans text-[0.8rem] font-semibold tracking-[0.08em] uppercase px-[0.9rem] py-[0.9rem] rounded-[2px] transition-colors duration-200 border border-border text-ink hover:bg-ink hover:text-paper">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-[1400px] mx-auto py-32 px-12">
        <div className="grid grid-cols-2 gap-20 items-center">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[0.65rem] text-rust tracking-[0.1em]">04</span>
              <div className="flex-1 h-px bg-border" />
              <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-mist">The Moat</span>
            </div>
            <h2 className="font-serif text-[clamp(2.2rem,3vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.02em] mb-6">
              The data is public.<br />The <em className="italic text-rust">intelligence</em><br />is not.
            </h2>
            <p className="font-sans text-[0.95rem] leading-[1.8] text-slate font-light mb-10">
              Cleaning, normalizing, and enriching Deeds Office data is hard operational work that a well-funded competitor can&apos;t instantly replicate. We&apos;ve spent 18 months building the pipeline so you can trust the output in seconds.
            </p>
            <div className="grid grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-paper p-7">
                <div className="font-serif text-[2rem] font-bold text-ink leading-none">18M+</div>
                <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase text-mist mt-1">Properties indexed</div>
              </div>
              <div className="bg-paper p-7">
                <div className="font-serif text-[2rem] font-bold text-ink leading-none">99.7%</div>
                <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase text-mist mt-1">Entity resolution accuracy</div>
              </div>
              <div className="bg-paper p-7">
                <div className="font-serif text-[2rem] font-bold text-ink leading-none">4hr</div>
                <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase text-mist mt-1">Avg. deeds update lag</div>
              </div>
              <div className="bg-paper p-7">
                <div className="font-serif text-[2rem] font-bold text-ink leading-none">POPIA</div>
                <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase text-mist mt-1">Compliant by design</div>
              </div>
            </div>
          </div>

          <div className="group stack-visual relative h-[480px] reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="absolute left-0 right-0 rounded-[3px] p-8 transition-transform duration-300 top-[60px] bg-aged border border-border rotate-[-2.5deg] group-hover:rotate-[-3.5deg] group-hover:translate-y-2">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
                <div className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-mist">Deed Record</div>
                <div className="font-mono text-[0.7rem] text-rust">T8841/2019</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Owner</div>
                <div className="font-sans text-[0.85rem] text-mist">Bayview Properties (Pty) Ltd</div>
              </div>
            </div>
            <div className="absolute left-0 right-0 rounded-[3px] p-8 transition-transform duration-300 top-[30px] bg-[#e0d8c4] border border-border rotate-[-1deg] group-hover:rotate-[-1.5deg] group-hover:translate-y-1">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
                <div className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-mist">Deed Record</div>
                <div className="font-mono text-[0.7rem] text-rust">T8841/2019</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Owner</div>
                <div className="font-sans text-[0.85rem] text-mist">Bayview Properties (Pty) Ltd</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Bond</div>
                <div className="font-sans text-[0.85rem] text-mist">Standard Bank — R2.4M</div>
              </div>
            </div>
            <div className="absolute left-0 right-0 rounded-[3px] p-8 transition-transform duration-300 top-0 bg-paper border border-[rgba(10,10,10,0.15)] shadow-[0_20px_60px_rgba(10,10,10,0.12)] rotate-0">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
                <div className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-mist">TitleChain Intelligence</div>
                <div className="font-mono text-[0.7rem] text-rust">T12847/2024</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Current Owner</div>
                <div className="font-sans text-[0.85rem] text-ink">Nomvula P. Dlamini</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Transfer Chain</div>
                <div className="font-sans text-[0.85rem] text-ink">3 verified transfers · 12yr history</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase text-mist mb-0.5">Active Encumbrances</div>
                <div className="font-sans text-[0.85rem] text-ink">FNB Bond B7743 · R1.85M · Current</div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <div className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-mist">Risk Score</div>
                <div className="flex-1 h-1 bg-aged rounded-[2px] overflow-hidden">
                  <div className="h-full bg-[linear-gradient(90deg,#4ade80,#fbbf24,var(--rust))] rounded-[2px]" style={{ width: "18%" }} />
                </div>
                <div className="font-mono text-[0.7rem] text-[#4ade80] font-medium">Low</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-32 px-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(184,149,58,0.08)_0%,transparent_60%),radial-gradient(ellipse_at_70%_50%,rgba(200,75,47,0.06)_0%,transparent_60%)]" />
        <div className="relative max-w-[700px] mx-auto reveal opacity-0 translate-y-8 transition-all duration-700">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="font-mono text-[0.65rem] text-[rgba(245,240,232,0.3)] tracking-[0.1em]">→</span>
            <div className="flex-1 h-px bg-[rgba(245,240,232,0.1)] max-w-[100px]" />
            <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(245,240,232,0.3)]">Early Access</span>
            <div className="flex-1 h-px bg-[rgba(245,240,232,0.1)] max-w-[100px]" />
          </div>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,5rem)] font-black leading-[0.95] tracking-[-0.03em] text-paper mb-6">
            Know before<br />you <em className="italic text-gold-light">commit.</em>
          </h2>
          <p className="font-sans text-base text-[rgba(245,240,232,0.45)] font-light leading-[1.7] mb-12">
            Join the waitlist. We&apos;re onboarding conveyancing practices and banks in Q3 2025. First 50 firms get 500 free lookups.
          </p>
          <div className="flex gap-0 max-w-[480px] mx-auto mb-6 border border-[rgba(245,240,232,0.15)] rounded-[3px] overflow-hidden">
            <input className="flex-1 bg-[rgba(245,240,232,0.05)] border-none outline-none px-5 py-[0.9rem] font-sans text-[0.88rem] text-paper font-light placeholder:text-[rgba(245,240,232,0.25)]" type="email" placeholder="your@lawfirm.co.za" />
            <button className="bg-rust border-none px-6 py-[0.9rem] font-sans text-[0.8rem] font-semibold tracking-[0.08em] uppercase text-paper cursor-none transition-colors duration-200 hover:bg-rust-dark">Join Waitlist</button>
          </div>
          <p className="font-mono text-[0.62rem] tracking-[0.12em] uppercase text-[rgba(245,240,232,0.25)]">No spam. Unsubscribe anytime. POPIA compliant.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink border-t border-[rgba(255,255,255,0.06)] p-12 flex items-center justify-between">
        <div className="font-serif text-base font-bold text-[rgba(245,240,232,0.5)]">TitleChain</div>
        <p className="font-mono text-[0.62rem] tracking-[0.1em] text-[rgba(245,240,232,0.2)]">© 2025 TitleChain Pty Ltd · Sandton, South Africa</p>
        <ul className="flex gap-8 list-none">
          <li><a href="#" className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(245,240,232,0.25)] no-underline transition-colors duration-200 hover:text-gold">Privacy</a></li>
          <li><a href="#" className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(245,240,232,0.25)] no-underline transition-colors duration-200 hover:text-gold">Terms</a></li>
          <li><a href="#" className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(245,240,232,0.25)] no-underline transition-colors duration-200 hover:text-gold">API Docs</a></li>
          <li><a href="#" className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-[rgba(245,240,232,0.25)] no-underline transition-colors duration-200 hover:text-gold">Contact</a></li>
        </ul>
      </footer>
    </>
  );
}
