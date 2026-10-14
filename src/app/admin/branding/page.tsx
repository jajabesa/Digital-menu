
"use client"

import { useState, useEffect } from "react"
import { updateBranding } from "@/app/actions/branding"
import { Palette, Image as ImageIcon, Sparkles } from "lucide-react"

export default function BrandingPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Live Brand State
  const [primaryColor, setPrimaryColor] = useState("#0f172a")
  const [secondaryColor, setSecondaryColor] = useState("#f8fafc")
  const [accentColor, setAccentColor] = useState("#e2e8f0")
  const [logoUrl, setLogoUrl] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")

  // New: Image Upload State
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [coverPreview, setCoverPreview] = useState("")

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/admin/branding")

        if (res.ok) {
          const data = await res.json()

          if (data) {
            setPrimaryColor(data.primaryColor || "#0f172a")
            setSecondaryColor(data.secondaryColor || "#f8fafc")
            setAccentColor(data.accentColor || "#e2e8f0")
            setLogoUrl(data.logoUrl || "")
            setCoverImageUrl(data.coverImageUrl || "")
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setFetching(false)
      }
    }

    loadBranding()
  }, [])

  // Clean up temporary image previews
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  // Handle image selection
  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) {
    const file = e.target.files?.[0]

    if (!file) return

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Please select a JPG, PNG, or WebP image.",
      })
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image size must be less than 5 MB.",
      })
      e.target.value = ""
      return
    }

    const preview = URL.createObjectURL(file)

    if (type === "logo") {
      setLogoFile(file)
      setLogoPreview(preview)
    } else {
      setCoverFile(file)
      setCoverPreview(preview)
    }

    setMessage(null)
  }

  // Upload image to backend
  async function uploadImage(
    file: File,
    kind: "logo" | "cover"
  ) {
    const formData = new FormData()

    formData.append("file", file)
    formData.append("kind", kind)

    const res = await fetch("/api/admin/branding/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Image upload failed")
    }

    if (typeof data.url !== "string") {
      throw new Error("Invalid upload response")
    }

    return data.url as string
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData(e.currentTarget)

      let finalLogoUrl = logoUrl
      let finalCoverUrl = coverImageUrl

      // Upload selected logo
      if (logoFile) {
        finalLogoUrl = await uploadImage(logoFile, "logo")
        formData.set("logoUrl", finalLogoUrl)
      }

      // Upload selected cover
      if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile, "cover")
        formData.set("coverImageUrl", finalCoverUrl)
      }

      // Save branding settings
      const res = await updateBranding(formData)

      if (res.error) {
        setMessage({
          type: "error",
          text: res.error,
        })
      } else if (res.success) {
        setLogoUrl(finalLogoUrl)
        setCoverImageUrl(finalCoverUrl)

        setLogoFile(null)
        setCoverFile(null)

        setLogoPreview("")
        setCoverPreview("")

        setMessage({
          type: "success",
          text: res.success,
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong while saving.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="text-slate-500 text-sm">
        Loading brand configuration...
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Brand & Colors
        </h1>

        <p className="text-sm text-slate-500">
          Customize your visual identity. Colors will
          automatically apply to your public customer menu.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Branding Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color Palette
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Primary Color
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={primaryColor}
                    onChange={(e) =>
                      setPrimaryColor(e.target.value)
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />

                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) =>
                      setPrimaryColor(e.target.value)
                    }
                    className="w-full px-2 py-1.5 border rounded text-xs font-mono"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Background / Secondary
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) =>
                      setSecondaryColor(e.target.value)
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />

                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) =>
                      setSecondaryColor(e.target.value)
                    }
                    className="w-full px-2 py-1.5 border rounded text-xs font-mono"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Accent / Highlights
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="accentColor"
                    value={accentColor}
                    onChange={(e) =>
                      setAccentColor(e.target.value)
                    }
                    className="w-10 h-10 rounded border cursor-pointer"
                  />

                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) =>
                      setAccentColor(e.target.value)
                    }
                    className="w-full px-2 py-1.5 border rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Media & Image Assets */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Brand Assets (Images)
            </h3>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Logo Image URL
              </label>

              <input
                type="url"
                name="logoUrl"
                value={logoUrl ?? ""}
                onChange={(e) => {
                  setLogoUrl(e.target.value)
                  setLogoFile(null)
                  setLogoPreview("")
                }}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />

              {/* NEW: Upload Logo */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Or Upload Logo
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    handleImageSelect(e, "logo")
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />

                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG or WebP. Maximum 5 MB.
                </p>
              </div>

              {/* Logo Preview */}
              {(logoPreview || logoUrl) && (
                <div className="mt-3">
                  <img
                    src={logoPreview || logoUrl}
                    alt="Logo preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cover Image URL
              </label>

              <input
                type="url"
                name="coverImageUrl"
                value={coverImageUrl ?? ""}
                onChange={(e) => {
                  setCoverImageUrl(e.target.value)
                  setCoverFile(null)
                  setCoverPreview("")
                }}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />

              {/* NEW: Upload Cover */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Or Upload Cover Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    handleImageSelect(e, "cover")
                  }
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />

                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG or WebP. Maximum 5 MB.
                </p>
              </div>

              {/* Cover Preview */}
              {(coverPreview || coverImageUrl) && (
                <div className="mt-3">
                  <img
                    src={coverPreview || coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              disabled={loading}
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading
                ? "Saving Brand Settings..."
                : "Save Brand Settings"}
            </button>
          </div>
        </form>

        {/* Real-time Interactive Mobile Card Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Live Customer Mobile Preview
          </div>

          <div
            className="w-full max-w-sm mx-auto rounded-3xl border-8 border-slate-900 overflow-hidden shadow-2xl transition-colors duration-300"
            style={{ backgroundColor: secondaryColor }}
          >
            {/* Header Cover Banner */}
            <div
              className="h-32 bg-slate-200 bg-cover bg-center flex items-end p-4"
              style={{
                backgroundImage:
                  coverPreview || coverImageUrl
                    ? `url("${coverPreview || coverImageUrl}")`
                    : undefined,
              }}
            >
              {logoPreview || logoUrl ? (
                <img
                  src={logoPreview || logoUrl}
                  alt="Logo"
                  className="w-12 h-12 rounded-full border-2 border-white object-cover bg-white shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  LOGO
                </div>
              )}
            </div>

            {/* Menu Header Preview Details */}
            <div className="p-4 space-y-3">
              <h4
                className="font-bold text-lg"
                style={{ color: primaryColor }}
              >
                Sample Restaurant
              </h4>

              <p
                className="text-xs opacity-75"
                style={{ color: primaryColor }}
              >
                Premium dining & drinks experience.
              </p>

              {/* Sample Categories Bar */}
              <div className="flex gap-2 overflow-x-auto py-1">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                  style={{
                    backgroundColor: primaryColor,
                    color: secondaryColor,
                  }}
                >
                  Breakfast
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: accentColor,
                    color: primaryColor,
                  }}
                >
                  Drinks
                </span>
              </div>

              {/* Sample Menu Item Card */}
              <div
                className="p-3 rounded-xl border flex items-center justify-between shadow-sm"
                style={{
                  borderColor: accentColor,
                  backgroundColor: "#ffffff",
                }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: primaryColor }}
                  >
                    Cappuccino
                  </p>

                  <p className="text-xs text-slate-500">
                    Espresso with milk foam
                  </p>

                  <span
                    className="text-xs font-bold mt-1 inline-block"
                    style={{ color: primaryColor }}
                  >
                    250 ETB
                  </span>
                </div>

                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  IMG
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
