"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../_providers/auth-provider"
import { TitlechainLogo } from "@/app/_components/solar/TitlechainLogo"

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <TitlechainLogo className="h-8 w-auto" />
          </Link>
          <h1 className="text-[28px] font-semibold tracking-tighter text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your TitleChain account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 ring-1 ring-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                placeholder="you@firm.co.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border-b-[1.5px] border-orange-700 bg-linear-to-b from-orange-400 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_0_2px_rgba(0,0,0,0.04)] transition-all duration-200 ease-in-out hover:shadow-orange-300 disabled:opacity-50"
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

          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              Demo Account
            </p>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-500">Email</span>
              <span className="font-mono text-gray-800 text-xs">
                demo@titlechain.co.za
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Password</span>
              <span className="font-mono text-gray-800 text-xs">
                demo1234
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
