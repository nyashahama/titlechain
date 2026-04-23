"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMatter } from "../../_lib/mock-data";
import { useAuth } from "../../_providers/auth-provider";

export default function NewMatterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [propertyDescription, setPropertyDescription] = useState("");
  const [locality, setLocality] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [titleRef, setTitleRef] = useState("");
  const [matterRef, setMatterRef] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const matter = createMatter({
      property_description: propertyDescription,
      locality_or_area: locality,
      municipality_or_deeds_office: municipality,
      title_reference: titleRef || undefined,
      matter_reference: matterRef || undefined,
      created_by: user.id,
    });
    setLoading(false);
    router.push(`/matters/${matter.id}`);
  }

  const quickEntries = [
    { desc: "Erf 100, Rosebank", loc: "Rosebank", mun: "City of Johannesburg", result: "Clear" },
    { desc: "Erf 50, Sandton", loc: "Sandton", mun: "City of Johannesburg", result: "Review" },
    { desc: "Erf 10, Centurion", loc: "Centurion", mun: "City of Tshwane", result: "Stop" },
  ];

  function fillForm(entry: typeof quickEntries[0]) {
    setPropertyDescription(entry.desc);
    setLocality(entry.loc);
    setMunicipality(entry.mun);
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/matters"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to matters
        </Link>
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">New Clear-to-Lodge Check</h1>
        <p className="text-[13px] text-muted mt-1">Enter property details to run a verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Form */}
        <div className="border border-border rounded-2xl bg-card/20 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                Property Description *
              </label>
              <input
                required
                value={propertyDescription}
                onChange={(e) => setPropertyDescription(e.target.value)}
                className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="E.g. Erf 412, Rosebank Township"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                  Locality / Area *
                </label>
                <input
                  required
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                  placeholder="E.g. Rosebank"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                  Municipality / Deeds Office *
                </label>
                <input
                  required
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                  placeholder="E.g. City of Johannesburg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                  Title Reference
                </label>
                <input
                  value={titleRef}
                  onChange={(e) => setTitleRef(e.target.value)}
                  className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                  placeholder="E.g. T12345/2018"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
                  Matter Reference
                </label>
                <input
                  value={matterRef}
                  onChange={(e) => setMatterRef(e.target.value)}
                  className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                  placeholder="E.g. M-2025-001"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background text-[14px] font-semibold px-4 py-[11px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running verification...
                </>
              ) : (
                "Run Clear-to-Lodge Check"
              )}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Quick Fill</h3>
            <p className="text-[12px] text-muted mb-3">Click to pre-fill the form with demo data</p>
            <div className="space-y-2">
              {quickEntries.map((entry) => (
                <button
                  key={entry.desc}
                  onClick={() => fillForm(entry)}
                  className="w-full text-left p-3 rounded-xl border border-border/40 bg-card/30 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-foreground/80 font-medium">{entry.desc}</span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: entry.result === "Clear" ? "#4ade80" : entry.result === "Stop" ? "#ef4444" : "#fbbf24",
                        backgroundColor: entry.result === "Clear" ? "rgba(74,222,128,0.1)" : entry.result === "Stop" ? "rgba(239,68,68,0.1)" : "rgba(251,191,36,0.1)",
                      }}
                    >
                      {entry.result}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">{entry.loc} · {entry.mun}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">What happens next</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "We query the Deeds Office, municipal records, and fraud databases" },
                { step: "2", text: "Our engine cross-references all sources for conflicts" },
                { step: "3", text: "You get a Clear, Review, or Stop decision with evidence" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px] text-muted shrink-0 mt-0.5">{item.step}</span>
                  <p className="text-[12px] text-foreground/70 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
