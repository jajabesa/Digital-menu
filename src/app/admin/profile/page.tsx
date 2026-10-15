"use client"

import { useState, useEffect } from "react"
import { updateBusinessProfile } from "@/app/actions/profile"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/admin/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setFetching(false)
      }
    }
    loadProfile()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateBusinessProfile(formData)

    if (res.error) {
      setMessage({ type: "error", text: res.error })
    } else if (res.success) {
      setMessage({ type: "success", text: res.success })
    }
    setLoading(false)
  }

  if (fetching) {
    return <div className="text-slate-500 text-sm">Loading business profile...</div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
        <p className="text-sm text-slate-500">Configure public business details displayed on your digital menu header.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm border ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Business Name</label>
            <input
              required
              name="name"
              defaultValue={profile?.name || ""}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Business Type</label>
            <select
              required
              name="type"
              defaultValue={profile?.type || "Restaurant"}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm bg-white"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Bar">Bar / Lounge</option>
              <option value="Bakery">Bakery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone Number</label>
            <input
              name="phone"
              defaultValue={profile?.phone || ""}
              placeholder="+251 911 000 000"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Public Email</label>
            <input
              type="email"
              name="email"
              defaultValue={profile?.email || ""}
              placeholder="contact@hotel.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Physical Address / Location</label>
          <input
            name="address"
            defaultValue={profile?.address || ""}
            placeholder="Bole Road, Addis Ababa, Ethiopia"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Short Description / Bio</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={profile?.description || ""}
            placeholder="A premium dining experience featuring local and international cuisine..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            disabled={loading}
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}