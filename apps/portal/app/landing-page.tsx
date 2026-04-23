"use client";

import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 20) {
        nav.style.backgroundColor = "rgba(0,0,0,0.8)";
        nav.style.backdropFilter = "blur(12px)";
        nav.style.borderBottomColor = "rgba(255,255,255,0.06)";
      } else {
        nav.style.backgroundColor = "transparent";
        nav.style.backdropFilter = "";
        nav.style.borderBottomColor = "transparent";
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const marqueeItems = [
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
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav
        id="nav"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3.5 border-b border-transparent transition-all duration-300"
      >
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="text-foreground">
              <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-semibold text-[15px] tracking-tight">TitleChain</span>
          </a>
          <ul className="hidden lg:flex items-center gap-6 list-none">
            {[
              { label: "Product", hasDropdown: true },
              { label: "Resources", hasDropdown: true },
              { label: "Solutions", hasDropdown: true },
              { label: "Enterprise", hasDropdown: false },
              { label: "Pricing", hasDropdown: false },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className="flex items-center gap-1 text-[13px] text-muted hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                  {item.hasDropdown && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-muted">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden md:block text-[13px] font-medium px-4 py-[7px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5"
          >
            Ask AI
          </a>
          <a href="#" className="hidden md:block text-[13px] text-muted hover:text-foreground transition-colors">
            Log In
          </a>
          <a
            href="#"
            className="bg-foreground text-background text-[13px] font-medium px-4 py-[7px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-0 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            height: "70%",
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(50,200,180,0.20) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.15) 0%, transparent 45%), radial-gradient(ellipse at 70% 50%, rgba(251,191,36,0.12) 0%, transparent 40%), radial-gradient(ellipse at 85% 50%, rgba(239,68,68,0.10) 0%, transparent 35%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto pt-12">
          <h1 className="text-[clamp(42px,7vw,80px)] font-bold leading-[1.02] tracking-[-0.04em] mb-6">
            Verify property
            <br />
            titles in seconds.
          </h1>
          <p className="text-[18px] text-muted leading-[1.6] max-w-[520px] mx-auto mb-8">
            The intelligence layer for South African property transfers.
            Built for conveyancers, banks, and insurers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-foreground text-background text-[14px] font-medium px-5 py-[10px] rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1L11.5 10.5H0.5L6 1Z" />
              </svg>
              Request API Access
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[14px] font-medium px-5 py-[10px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5"
            >
              Get a Demo
            </a>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex justify-center">
          <div className="relative" style={{ width: "min(420px, 70vw)", height: "min(360px, 55vw)" }}>
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-20%",
                background:
                  "radial-gradient(ellipse at 30% 60%, rgba(50,200,180,0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% 60%, rgba(74,222,128,0.12) 0%, transparent 45%), radial-gradient(ellipse at 70% 60%, rgba(251,191,36,0.10) 0%, transparent 40%), radial-gradient(ellipse at 85% 60%, rgba(239,68,68,0.08) 0%, transparent 35%)",
                filter: "blur(20px)",
              }}
            />
            <svg
              viewBox="0 0 400 340"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 0 40px rgba(255,255,255,0.06))" }}
            >
              <path
                d="M200 40 L360 300 H40 L200 40Z"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M200 80 L320 280 H80 L200 80Z"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M200 120 L280 260 H120 L200 120Z"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M200 160 L240 240 H160 L200 160Z"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                fill="rgba(255,255,255,0.02)"
              />
              <line x1="80" y1="200" x2="320" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="120" y1="160" x2="280" y2="160" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="160" y1="120" x2="240" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border py-3.5 bg-background">
        <div className="flex gap-10 animate-[marquee_30s_linear_infinite] w-max">
          {marqueeItems.map(([text, highlight], i) => (
            <span
              key={i}
              className={`font-mono text-[12px] tracking-[0.1em] uppercase whitespace-nowrap ${
                highlight ? "text-foreground/70" : "text-muted-more"
              }`}
            >
              {text}
            </span>
          ))}
          {marqueeItems.map(([text, highlight], i) => (
            <span
              key={`dup-${i}`}
              className={`font-mono text-[12px] tracking-[0.1em] uppercase whitespace-nowrap ${
                highlight ? "text-foreground/70" : "text-muted-more"
              }`}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* THE STATUS QUO — large centered statement, like Vercel's "Develop with your favorite tools" */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center overflow-hidden">
        {/* Subtle aurora line across top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(50,200,180,0.4), rgba(74,222,128,0.4), rgba(251,191,36,0.3), rgba(239,68,68,0.3), transparent)",
          }}
        />
        <div className="max-w-[720px] mx-auto relative z-10">
          <p className="text-[clamp(22px,3vw,32px)] font-medium leading-[1.3] tracking-[-0.02em] text-foreground/90">
            Today, property professionals still piece together the truth from{" "}
            <span className="text-muted">disconnected systems,</span>{" "}
            <span className="text-muted">manual checks,</span> and{" "}
            <span className="text-muted">slow government processes.</span>
          </p>
          <p className="text-[clamp(18px,2.5vw,26px)] font-medium leading-[1.4] tracking-[-0.01em] text-muted mt-8">
            TitleChain gives one trusted answer before lodgement or payout.
          </p>
        </div>
      </section>

      {/* THREE DECISIONS — massive words with color glow, minimal description */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10">
            {[
              { word: "Clear", color: "#4ade80", desc: "Proceed with confidence" },
              { word: "Review", color: "#fbbf24", desc: "Human review needed" },
              { word: "Stop", color: "#ef4444", desc: "Hard blocker detected" },
            ].map((item) => (
              <div key={item.word} className="text-center">
                <div
                  className="text-[clamp(36px,6vw,72px)] font-bold leading-none tracking-[-0.04em] mb-3"
                  style={{
                    color: item.color,
                    textShadow: `0 0 60px ${item.color}30, 0 0 120px ${item.color}15`,
                  }}
                >
                  {item.word}
                </div>
                <div className="font-mono text-[11px] md:text-[12px] tracking-[0.12em] uppercase text-muted-more">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[15px] md:text-[16px] text-muted leading-[1.6] max-w-[480px] mx-auto">
            Decision at the top. Evidence underneath. Audit trail throughout.
            Not another report — one operational answer backed by source provenance.
          </p>
        </div>
      </section>

      {/* BUILT FOR — inline badges like Vercel's "Scale your Enterprise without compromising Security" */}
      <section className="px-6 py-24 md:py-32 text-center border-t border-border">
        <h2 className="text-[clamp(26px,4vw,48px)] font-bold leading-[1.15] tracking-[-0.03em]">
          Built for{" "}
          <a href="#" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light text-[clamp(14px,2.5vw,22px)] font-medium align-middle hover:bg-white/5 transition-colors">
            Conveyancers
          </a>{" "}
          and{" "}
          <a href="#" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light text-[clamp(14px,2.5vw,22px)] font-medium align-middle hover:bg-white/5 transition-colors">
            Banks
          </a>
        </h2>
        <p className="text-[16px] text-muted max-w-[520px] mx-auto mt-6 leading-[1.6]">
          One queryable record for every stakeholder in the property transaction chain.
        </p>
      </section>

      {/* DUAL CTA CARDS */}
      <section className="px-6 pb-24 md:pb-32 max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
          <div className="bg-card p-10 md:p-12">
            <p className="text-[16px] leading-[1.7] text-foreground/80 mb-8">
              <strong className="text-foreground">Ready to start?</strong> Start building with a free account.
              Speak to an expert for your <em className="italic">Professional</em> or{" "}
              <em className="italic">Enterprise</em> needs.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="bg-foreground text-background text-[13px] font-medium px-5 py-[9px] rounded-full transition-opacity duration-200 hover:opacity-80"
              >
                Join Waitlist
              </a>
              <a
                href="#"
                className="text-[13px] font-medium px-5 py-[9px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5"
              >
                Talk to an Expert
              </a>
            </div>
          </div>
          <div className="bg-card p-10 md:p-12">
            <p className="text-[16px] leading-[1.7] text-foreground/80 mb-8">
              <strong className="text-foreground">Explore TitleChain Enterprise</strong> with an interactive
              product tour, trial, or a personalized demo.
            </p>
            <a
              href="#"
              className="inline-block text-[13px] font-medium px-5 py-[9px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5"
            >
              Explore Enterprise
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {[
            { title: "Product", links: ["Title Intelligence", "Transfer Monitor", "Risk & Fraud Score", "Pricing"] },
            { title: "Resources", links: ["API Documentation", "Status Page", "Changelog", "Support"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "POPIA Compliance", "Security"] },
            { title: "Social", links: ["Twitter / X", "LinkedIn", "GitHub"] },
            { title: "Get Started", links: ["Request Access", "Schedule Demo", "Talk to Sales"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.1em] text-muted mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-muted-more hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
          <span className="font-semibold text-[15px] text-foreground/50">TitleChain</span>
          <span className="font-mono text-[11px] text-muted-more">© 2025 TitleChain Pty Ltd · Sandton, South Africa</span>
        </div>
      </footer>
    </div>
  );
}
