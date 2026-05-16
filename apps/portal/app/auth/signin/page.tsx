"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../_providers/auth-provider";
import { AuthLayout } from "@/app/_components/landing/layout/AuthLayout";
import { Button } from "@/app/_components/landing/shared/Button";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function useDemoWorkspace() {
    setEmail("demo@titlechain.co.za");
    setPassword("demo1234");
    setError("");
  }

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
      <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-white/45">
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-indigo-300" aria-hidden="true" />
          Pilot workspace
        </span>
        <span className="text-indigo-200/65">Registry session</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="signin-email"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="you@firm.co.za"
          />
        </div>
        <div>
          <label
            htmlFor="signin-password"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 pr-11 text-sm text-white placeholder:text-white/25 transition-colors focus:border-indigo-400/50 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
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
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-white/45">
              Demo workspace
            </p>
            <p className="mt-1 truncate font-mono text-xs text-white/58">
              demo@titlechain.co.za
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={useDemoWorkspace}
          >
            Use demo workspace
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
