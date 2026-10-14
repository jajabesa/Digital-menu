"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (res?.error) {
      setError("Invalid email or password.")
      setLoading(false)
    } else {
      const sessionResponse = await fetch("/api/auth/session")
      const session = await sessionResponse.json()
      router.push(session?.user?.role === "PLATFORM_ADMIN" ? "/platform/dashboard" : "/admin/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Sign In</h1>
        <p className="text-sm text-slate-600 mb-6">Manage your business menus and brand settings.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email Address</label>
            <input required type="email" name="email" placeholder="admin@hotel.com" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
            <input required type="password" name="password" placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition disabled:opacity-50">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Need a platform account? <Link href="/register" className="text-slate-900 font-semibold underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}
