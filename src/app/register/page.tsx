"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerBusiness } from "@/app/actions/register"
import Link from "next/link"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await registerBusiness(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/login?registered=true")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Register Business</h1>
        <p className="text-sm text-slate-600 mb-6">Start managing your dynamic digital menu platform.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Business Name</label>
            <input required name="businessName" placeholder="e.g. Grand Hotel & Resort" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Business Type</label>
            <select required name="businessType" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Café</option>
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Bar">Bar / Lounge</option>
              <option value="Bakery">Bakery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Work Email</label>
            <input required type="email" name="email" placeholder="admin@hotel.com" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
            <input required type="password" name="password" placeholder="••••••••" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone Number (Optional)</label>
            <input name="phone" placeholder="+251 912 345 678" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link href="/login" className="text-slate-900 font-semibold underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}