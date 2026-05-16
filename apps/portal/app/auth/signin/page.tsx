"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_providers/auth-provider";
import { AuthLayout } from "@/app/_components/landing/layout/AuthLayout";
import { Button } from "@/app/_components/landing/shared/Button";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("demo@titlechain.co.za");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/matters");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your TitleChain account"
      footer={
        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <div className="text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-indigo-300 hover:text-indigo-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="you@firm.co.za"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            Demo access
          </p>
          <p className="text-right text-xs text-white/35">
            Copy these credentials into the form.
          </p>
        </div>
        <div className="grid gap-1.5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/40">Email</span>
            <span className="min-w-0 break-all text-right font-mono text-xs text-white/58">
              demo@titlechain.co.za
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/40">Password</span>
            <span className="font-mono text-xs text-white/58">demo1234</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
