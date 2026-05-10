"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth-provider"
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("demo@titlechain.co.za")
  const [password, setPassword] = useState("demo1234")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signIn(email, password)
      router.push("/matters")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6 text-foreground sm:p-6">
      <div className="w-full max-w-[420px] min-w-0 animate-page-enter">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <TitlechainLogo className="h-8 w-auto text-foreground" />
          </Link>
          <h1 className="text-[28px] font-semibold tracking-tighter text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to your TitleChain account
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/30 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-more transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="you@firm.co.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-more transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border-b-[1.5px] border-orange-700 bg-linear-to-b from-orange-400 to-orange-500 px-4 py-2.5 text-sm font-medium text-background shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-all duration-200 ease-in-out hover:shadow-orange-500/30 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-300 mb-3">
              Demo Account
            </p>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm mb-1.5">
              <span className="text-muted">Email</span>
              <span className="min-w-0 break-all text-right font-mono text-foreground/80 text-xs">
                demo@titlechain.co.za
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <span className="text-muted">Password</span>
              <span className="font-mono text-foreground/80 text-xs">
                demo1234
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="text-muted transition-colors hover:text-foreground">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
