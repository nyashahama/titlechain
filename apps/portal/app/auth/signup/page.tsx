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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="text-foreground">
              <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-semibold text-[15px] tracking-tight">TitleChain</span>
          </Link>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-foreground">Create your account</h1>
          <p className="text-[13px] text-muted mt-1">Start verifying property titles</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">Full Name</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="John van der Merwe"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">Firm Name</label>
            <input
              required
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="Van der Merwe & Associates Inc"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
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
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[9px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted mt-6">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
