"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_providers/auth-provider";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp({ email, password, display_name: displayName, firm_name: firmName });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(74,222,128,0.06) 0%, transparent 50%)" }} />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-foreground">
              <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-semibold text-[16px] tracking-tight">TitleChain</span>
          </Link>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground mb-2">Create your account</h1>
          <p className="text-[14px] text-muted">Start your free 14-day trial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">Full Name</label>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="Nyasha Hama"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">Firm Name</label>
              <input
                required
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
                placeholder="Hama & Associates"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="you@firm.co.za"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border-light rounded-xl px-4 py-[10px] text-[14px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          {error && <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-[14px] font-semibold px-4 py-[11px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted mt-8">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-foreground hover:underline font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
