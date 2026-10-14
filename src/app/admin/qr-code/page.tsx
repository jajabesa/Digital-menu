"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toggleMenuStatus } from "@/app/actions/menus"
import { QrCode, Download, ExternalLink, Globe, CheckCircle2, AlertCircle } from "lucide-react"

export default function QrCodePage() {
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  async function loadData() {
    try {
      const res = await fetch("/api/admin/qr")
      if (res.ok) {
        const data = await res.json()
        setBusiness(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleToggle(menuId: string, currentStatus: "DRAFT" | "PUBLISHED") {
    const res = await toggleMenuStatus(menuId, currentStatus)
    if (res.success) loadData()
  }

  function downloadQRCode() {
    const svgElement = document.getElementById("business-qr-svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement("a")
    link.href = url
    link.download = `${business?.slug}-menu-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function copyPublicUrl() {
    const publicUrl = `${window.location.origin}/menu/${business?.slug}`
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return <div className="text-slate-900 font-medium text-sm">Loading QR configuration...</div>

  const publicMenuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu/${business?.slug}` : `/menu/${business?.slug}`

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR Code & Publishing</h1>
        <p className="text-sm text-slate-700">
          Generate your unique customer QR code and control which menus are live for patrons to scan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Code Card & Download Options */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">{business?.name}</h3>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Scan to view digital menu</p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-inner">
            <QRCodeSVG
              id="business-qr-svg"
              value={publicMenuUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={downloadQRCode}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download QR Code (SVG)
            </button>

            <button
              onClick={copyPublicUrl}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-xl text-xs transition border border-slate-300 flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Globe className="w-4 h-4" />}
              {copied ? "Link Copied to Clipboard!" : "Copy Public Menu Link"}
            </button>
          </div>
        </div>

        {/* Right Column: Publishing Controls & Status */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Menu Publishing Control</h3>
                <p className="text-xs text-slate-600 font-medium">Published menus appear immediately on your customer link.</p>
              </div>
              <a
                href={`/menu/${business?.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg text-xs transition border border-slate-300 flex items-center gap-1.5"
              >
                Open Menu <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {business?.menus?.length === 0 ? (
              <p className="text-sm text-slate-600 py-4">No menus created yet. Go to Menus & Items to create one.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {business.menus.map((menu: any) => (
                  <div key={menu.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{menu.name}</p>
                      <span className={`inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        menu.status === "PUBLISHED" ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-950"
                      }`}>
                        {menu.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggle(menu.id, menu.status)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition border ${
                        menu.status === "DRAFT"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                      }`}
                    >
                      {menu.status === "DRAFT" ? "Publish Menu" : "Unpublish to Draft"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-300 p-5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-700" /> Persistent QR Guarantee
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Your QR code encodes your permanent URL (`/menu/{business?.slug}`). If you change item prices, upload new images, or update descriptions, patrons will see the updates instantly without needing to reprint your physical QR codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}