"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_providers/auth-provider";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-card/30 border-r border-border items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10 max-w-[360px]">
          <div className="mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-foreground mb-6">
              <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-foreground mb-3">The verification layer for SA property transfers</h2>
            <p className="text-[14px] text-muted leading-[1.6]">Join 150+ conveyancing firms and lenders who trust TitleChain for Clear-to-Lodge decisions.</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Clear-to-Lodge Check", desc: "Under 2 minutes per matter" },
              { label: "12+ Data Sources", desc: "Deeds Office, Municipal, FIC, Bond Registry" },
              { label: "Defensible Evidence", desc: "Full audit trail for every decision" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="text-foreground">
                <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <span className="font-semibold text-[15px] tracking-tight">TitleChain</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground">Welcome back</h1>
            <p className="text-[13px] text-muted mt-1">Sign in to your TitleChain account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[8px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="you@firm.co.za"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[8px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[10px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[13px] text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-foreground hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
