"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    await new Promise((r) => setTimeout(r, 1500));
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

  return (
    <div className="p-6 md:p-10 max-w-2xl animate-slide-in">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-foreground">New Clear-to-Lodge Check</h1>
        <p className="text-[13px] text-muted mt-1">Enter property details to run a verification</p>
      </div>

      <div className="border border-border rounded-2xl bg-card/20 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
              Property Description *
            </label>
            <input
              required
              value={propertyDescription}
              onChange={(e) => setPropertyDescription(e.target.value)}
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="E.g. Erf 412, Rosebank Township"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
                Locality / Area *
              </label>
              <input
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="E.g. Rosebank"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
                Municipality / Deeds Office *
              </label>
              <input
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="E.g. City of Johannesburg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
                Title Reference
              </label>
              <input
                value={titleRef}
                onChange={(e) => setTitleRef(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="E.g. T12345/2018"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
                Matter Reference
              </label>
              <input
                value={matterRef}
                onChange={(e) => setMatterRef(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="E.g. M-2025-001"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-[14px] font-medium px-4 py-[10px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
}
