"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideUp, staggerContainer } from "@/app/_lib/animations";
import NumberFlow from "@number-flow/react";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ref, handler]);
}

export default function LandingPage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  useClickOutside(navRef, () => setActiveDropdown(null));

  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 20) {
        nav.style.backgroundColor = "rgba(0,0,0,0.85)";
        nav.style.backdropFilter = "blur(16px)";
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
    "Deeds Office Integration",
    "Lightstone Enrichment",
    "Municipal Valuations",
    "FIC Fraud Signals",
    "Bond Registry",
    "Entity Resolution",
    "Historical Versioning",
    "POPIA Compliant",
    "99.9% Uptime SLA",
    "REST + Webhook",
  ];

  const productDropdown = [
    { icon: ShieldIcon, title: "Clear-to-Lodge", desc: "One decision before every transfer", href: "/auth/signup" },
    { icon: SearchIcon, title: "Title Intelligence", desc: "Unified property record view", href: "/auth/signup" },
    { icon: AlertIcon, title: "Risk & Fraud Score", desc: "Anomaly detection across sources", href: "/auth/signup" },
    { icon: MonitorIcon, title: "Transfer Monitor", desc: "Track matters from intake to lodgement", href: "/auth/signup" },
  ];

  const resourcesDropdown = [
    { icon: DocIcon, title: "API Documentation", desc: "Full REST reference & webhooks", href: "#" },
    { icon: CodeIcon, title: "Developer Guide", desc: "Integrate in under 30 minutes", href: "#" },
    { icon: ChangelogIcon, title: "Changelog", desc: "Latest releases and updates", href: "#" },
    { icon: StatusIcon, title: "Status Page", desc: "Real-time system health", href: "#" },
  ];

  const solutionsDropdown = [
    { icon: BriefcaseIcon, title: "Conveyancers", desc: "Clear-to-lodge for high-volume firms", href: "/auth/signup" },
    { icon: BankIcon, title: "Banks & Lenders", desc: "Pre-approval risk screening", href: "/auth/signup" },
    { icon: InsuranceIcon, title: "Insurers", desc: "Portfolio monitoring & alerts", href: "/auth/signup" },
    { icon: GovtIcon, title: "Government", desc: "Deeds office workflow tools", href: "/auth/signup" },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "R2,499",
      period: "/month",
      description: "For small conveyancing firms getting started",
      features: ["50 checks / month", "Clear / Review / Stop decisions", "Email support", "Standard turnaround", "Basic API access"],
      cta: "Start Free Trial",
      href: "/auth/signup",
      popular: false,
    },
    {
      name: "Professional",
      price: "R7,999",
      period: "/month",
      description: "For growing firms with lender panel work",
      features: ["250 checks / month", "Priority turnaround (2h)", "Dedicated support", "Full evidence exports", "Advanced API access", "Bulk checks", "Team collaboration"],
      cta: "Start Free Trial",
      href: "/auth/signup",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For banks, insurers, and large firms",
      features: ["Unlimited checks", "SLA guarantees", "Custom integrations", "Dedicated account manager", "On-premise option", "Audit controls", "White-label API"],
      cta: "Talk to Sales",
      href: "#",
      popular: false,
    },
  ];

  const steps = [
    { num: "01", title: "Enter the property", desc: "Input the property description, locality, and municipality. Add optional title or matter references." },
    { num: "02", title: "TitleChain verifies", desc: "We query the Deeds Office, municipal records, bond registry, and fraud databases in parallel." },
    { num: "03", title: "Get your decision", desc: "Clear, Review, or Stop — with full evidence, confidence score, and audit trail underneath." },
  ];

  const testimonials = [
    { quote: "TitleChain caught a hidden interdict that would have cost us R2.4M in a failed transfer. It paid for itself in one matter.", author: "Thabo Mokoena", role: "Partner, Mokoena & Associates Inc", location: "Johannesburg" },
    { quote: "We used to spend 3 hours on title checks per matter. Now it's under 10 minutes with a decision we can defend to our lender clients.", author: "Sarah van der Merwe", role: "Director, Van der Merwe Conveyancers", location: "Cape Town" },
    { quote: "The Clear-to-Lodge decision is exactly what our underwriters needed. It fits directly into our bond origination workflow.", author: "James Nkosi", role: "Head of Risk, Standard Bank Home Loans", location: "Sandton" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav
        ref={navRef}
        id="nav"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3.5 border-b border-transparent transition-all duration-300"
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="text-foreground">
              <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-semibold text-[15px] tracking-tight">TitleChain</span>
          </Link>
          <ul className="hidden lg:flex items-center gap-1 list-none relative">
            {[
              { label: "Product", key: "product", items: productDropdown },
              { label: "Resources", key: "resources", items: resourcesDropdown },
              { label: "Solutions", key: "solutions", items: solutionsDropdown },
              { label: "Enterprise", key: null, href: "#" },
              { label: "Pricing", key: null, href: "#pricing" },
            ].map((item) => (
              <li key={item.label} className="relative">
                {item.key ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.key ? null : item.key!)}
                    className="flex items-center gap-1 text-[13px] text-muted hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/[0.03]"
                  >
                    {item.label}
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={`text-muted transition-transform duration-200 ${activeDropdown === item.key ? "rotate-180" : ""}`}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                ) : (
                  <a href={item.href!} className="flex items-center gap-1 text-[13px] text-muted hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/[0.03]">
                    {item.label}
                  </a>
                )}

                {item.key && activeDropdown === item.key && (
                  <div className="absolute top-full left-0 mt-2 w-[320px] bg-[#0a0a0a] border border-border rounded-xl p-2 shadow-2xl shadow-black/50 animate-slide-in">
                    {item.items.map((sub) => (
                      <a
                        key={sub.title}
                        href={sub.href}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] transition-colors">
                          <sub.icon className="text-muted group-hover:text-foreground transition-colors" />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{sub.title}</p>
                          <p className="text-[11px] text-muted mt-0.5">{sub.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="hidden md:block text-[13px] text-muted hover:text-foreground transition-colors px-3 py-1.5"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-foreground text-background text-[13px] font-medium px-4 py-[7px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-16 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            height: "80%",
            background: "radial-gradient(ellipse at 30% 40%, rgba(50,200,180,0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% 40%, rgba(74,222,128,0.12) 0%, transparent 45%), radial-gradient(ellipse at 70% 40%, rgba(251,191,36,0.10) 0%, transparent 40%), radial-gradient(ellipse at 85% 40%, rgba(239,68,68,0.08) 0%, transparent 35%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/[0.03] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
            </span>
            <span className="text-[11px] text-muted">Now verifying matters across South Africa</span>
          </div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={slideUp} className="text-[48px] md:text-[64px] font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
              Property Intelligence
              <br />
              <span className="text-muted">Built for South Africa</span>
            </motion.h1>
            <motion.p variants={slideUp} className="mt-6 text-[17px] text-muted max-w-[540px] mx-auto">
              Verify title, assess risk, and clear-to-lodge with confidence.
            </motion.p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-foreground text-background text-[14px] font-medium px-6 py-[10px] rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-[14px] font-medium px-6 py-[10px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5"
            >
              Request a Demo
            </Link>
          </div>
        </div>

        {/* Demo Card */}
        <div className="relative z-10 max-w-[720px] mx-auto">
          <div className="border border-border rounded-2xl bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]/60" />
              </div>
              <span className="text-[11px] text-muted font-mono ml-2">Clear-to-Lodge Check</span>
            </div>
            <div className="p-5 md:p-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Property Description</label>
                  <div className="bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground/80">Erf 412, Rosebank Township</div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Locality</label>
                  <div className="bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground/80">Rosebank</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1.5">Municipality</label>
                  <div className="bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground/80">City of Johannesburg</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.12)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Decision</p>
                  <p className="text-[16px] font-bold text-[#4ade80]">Clear to Lodge — 94% confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border py-3.5 bg-background">
        <div className="flex gap-10 animate-[marquee_30s_linear_infinite] w-max">
          {[...marqueeItems, ...marqueeItems].map((text, i) => (
            <span key={i} className="font-mono text-[12px] tracking-[0.1em] uppercase whitespace-nowrap text-muted-more">
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* STATUS QUO */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(50,200,180,0.4), rgba(74,222,128,0.4), rgba(251,191,36,0.3), rgba(239,68,68,0.3), transparent)" }} />
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
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="px-6 py-24 md:py-32 border-t border-border"
      >
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-foreground mb-3">How it works</h2>
            <p className="text-[15px] text-muted">From property to decision in under 2 minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <span className="text-[48px] font-bold text-white/[0.04] leading-none">{step.num}</span>
                <h3 className="text-[16px] font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-[13px] text-muted leading-[1.6]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* THREE DECISIONS */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative px-6 py-24 md:py-32 overflow-hidden border-t border-border"
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 60%)" }} />
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10">
            {[
              { word: "Clear", color: "#4ade80", desc: "Proceed with confidence" },
              { word: "Review", color: "#fbbf24", desc: "Human review needed" },
              { word: "Stop", color: "#ef4444", desc: "Hard blocker detected" },
            ].map((item) => (
              <div key={item.word} className="text-center">
                <div className="text-[clamp(36px,6vw,72px)] font-bold leading-none tracking-[-0.04em] mb-3" style={{ color: item.color, textShadow: `0 0 60px ${item.color}30, 0 0 120px ${item.color}15` }}>
                  {item.word}
                </div>
                <div className="font-mono text-[11px] md:text-[12px] tracking-[0.12em] uppercase text-muted-more">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-[15px] md:text-[16px] text-muted leading-[1.6] max-w-[480px] mx-auto">
            Decision at the top. Evidence underneath. Audit trail throughout.
            Not another report — one operational answer backed by source provenance.
          </p>
        </div>
      </motion.section>

      {/* BUILT FOR */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="px-6 py-24 md:py-32 text-center border-t border-border"
      >
        <h2 className="text-[clamp(26px,4vw,48px)] font-bold leading-[1.15] tracking-[-0.03em] mb-8">
          Built for{" "}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light text-[clamp(14px,2.5vw,22px)] font-medium align-middle">Conveyancers</span>{" "}
          and{" "}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light text-[clamp(14px,2.5vw,22px)] font-medium align-middle">Banks</span>
        </h2>
        <p className="text-[16px] text-muted max-w-[520px] mx-auto mb-12 leading-[1.6]">
          One queryable record for every stakeholder in the property transaction chain.
        </p>
        <div className="max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Clear-to-Lodge", value: "< 2 min", num: 2, suffix: " min", prefix: "< " },
            { label: "Evidence Sources", value: "12+", num: 12, suffix: "+", prefix: "" },
            { label: "Matter Accuracy", value: "99.2%", num: 99.2, suffix: "%", prefix: "" },
            { label: "Firms Onboarded", value: "150+", num: 150, suffix: "+", prefix: "" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border rounded-2xl bg-card/20 p-5 text-center">
              <p className="text-[24px] font-bold tracking-[-0.02em] text-foreground">
                {stat.prefix}<NumberFlow value={stat.num} />{stat.suffix}
              </p>
              <p className="text-[11px] text-muted uppercase tracking-wider font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* TESTIMONIALS */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="px-6 py-24 md:py-32 border-t border-border"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-foreground mb-3">Trusted by property professionals</h2>
            <p className="text-[15px] text-muted">From Johannesburg to Cape Town</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="border border-border rounded-2xl bg-card/20 p-6">
                <p className="text-[14px] text-foreground/80 leading-[1.7] mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{t.author}</p>
                  <p className="text-[11px] text-muted">{t.role}</p>
                  <p className="text-[11px] text-muted-more mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* PRICING */}
      <motion.section
        id="pricing"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="px-6 py-24 md:py-32 border-t border-border"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-[15px] text-muted">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`border rounded-2xl p-6 md:p-8 ${tier.popular ? "border-foreground/20 bg-white/[0.02]" : "border-border bg-card/20"}`}
              >
                {tier.popular && (
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-background bg-foreground px-2.5 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-[18px] font-bold text-foreground mb-1">{tier.name}</h3>
                <p className="text-[13px] text-muted mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[32px] font-bold tracking-[-0.03em] text-foreground">{tier.price}</span>
                  <span className="text-[13px] text-muted">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/80">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block w-full text-center text-[13px] font-medium px-4 py-[9px] rounded-full transition-opacity duration-200 hover:opacity-80 ${
                    tier.popular ? "bg-foreground text-background" : "border border-border-light text-foreground hover:bg-white/5"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* DUAL CTA */}
      <section className="px-6 pb-24 md:pb-32 max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
          <div className="bg-card p-10 md:p-12">
            <p className="text-[16px] leading-[1.7] text-foreground/80 mb-8">
              <strong className="text-foreground">Ready to start?</strong> Create a free account and run your first Clear-to-Lodge check in minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/signup" className="bg-foreground text-background text-[13px] font-medium px-5 py-[9px] rounded-full transition-opacity duration-200 hover:opacity-80">
                Start Free Trial
              </Link>
              <Link href="/auth/signin" className="text-[13px] font-medium px-5 py-[9px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5">
                Sign In
              </Link>
            </div>
          </div>
          <div className="bg-card p-10 md:p-12">
            <p className="text-[16px] leading-[1.7] text-foreground/80 mb-8">
              <strong className="text-foreground">Need a custom solution?</strong> Talk to our team about Enterprise pricing, integrations, and SLAs.
            </p>
            <a href="mailto:hello@titlechain.co.za" className="inline-block text-[13px] font-medium px-5 py-[9px] rounded-full border border-border-light text-foreground transition-colors duration-200 hover:bg-white/5">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {[
            { title: "Product", links: ["Clear-to-Lodge", "Title Intelligence", "Transfer Monitor", "Risk & Fraud Score", "Pricing"] },
            { title: "Resources", links: ["API Documentation", "Developer Guide", "Status Page", "Changelog", "Support"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "POPIA Compliance", "Security"] },
            { title: "Social", links: ["Twitter / X", "LinkedIn", "GitHub"] },
            { title: "Get Started", links: ["Start Free Trial", "Sign In", "Talk to Sales"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-[0.1em] text-muted mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href={l === "Sign In" ? "/auth/signin" : l === "Start Free Trial" ? "/auth/signup" : "#"} className="text-[13px] text-muted-more hover:text-foreground transition-colors">
                      {l}
                    </Link>
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

/* Icons */
function ShieldIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function AlertIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function MonitorIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
}
function DocIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function CodeIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
}
function ChangelogIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
}
function StatusIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
}
function BriefcaseIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
}
function BankIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 21v-6h6v6" /></svg>;
}
function InsuranceIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function GovtIcon({ className }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
