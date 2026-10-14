import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { QrCode, Sparkles, Smartphone, ShieldCheck, ArrowRight } from "lucide-react"

export const instant = false

export default async function LandingPage() {
  const session = await auth()
  if (session?.user) {
    redirect((session.user as any).role === "PLATFORM_ADMIN" ? "/platform/dashboard" : "/admin/dashboard")
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-orange-700 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-700 flex items-center justify-center font-black text-white shadow-md shadow-orange-900/30">
              DM
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              DigitalMenu<span className="text-orange-400">.saas</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-700 hover:bg-orange-600 text-white shadow-md shadow-orange-900/20 transition flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trilingual Support: English • አማርኛ • Afan Oromo</span>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Transform Your Restaurant with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-300">Branded Dynamic QR Menus</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
            The multi-tenant hospitality platform empowering businesses to design, customize, and publish instant QR code digital menus with full multi-language capabilities.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-900/25 transition flex items-center justify-center gap-2"
          >
            Launch Admin Suite <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 text-orange-400" /> Generate Table QRs
          </Link>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-12">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950 text-orange-400 border border-orange-800/40 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Instant QR Generation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Export high-resolution table QR codes linking patrons straight to your active dynamic menu in seconds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Trilingual Customer Experience</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Seamless EN / አማ / ORO language toggling designed natively for Ethiopian hospitality.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Multi-Tenant Isolation</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every business owns its isolated branding tokens, menu items, prices, and status updates.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 Digital Menu Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
