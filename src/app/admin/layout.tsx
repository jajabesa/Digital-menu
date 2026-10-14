import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { 
  LayoutDashboard, 
  Store, 
  Palette, 
  UtensilsCrossed, 
  QrCode, 
  Eye, 
  LogOut 
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { logout } from "@/app/actions/auth"

// Async inner component that safely performs dynamic data fetching inside Suspense
async function AdminSidebarContent() {
  const session = await auth()

  // Keep platform admins on the dashboard selected by the user. They can
  // still use shared admin pages when an appropriate tenant is selected.
  if ((session?.user as any)?.role === "PLATFORM_ADMIN") redirect("/platform/dashboard")

  const { businessId, businessSlug } = await requireBusinessAdmin()

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, type: true }
  })

  return (
    <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex-shrink-0 flex flex-col justify-between md:sticky md:top-0 md:h-screen">
      <div>
        {/* Tenant Brand Identity */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white truncate">{business?.name || "Business Admin"}</h2>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
            {business?.type || "Hospitality"}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="p-4 grid grid-cols-2 gap-1 md:grid-cols-1 md:space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          >
            <Store className="w-4 h-4" />
            Business Profile
          </Link>

          <Link
            href="/admin/branding"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          >
            <Palette className="w-4 h-4" />
            Brand & Colors
          </Link>

          <Link
            href="/admin/menus"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Menus & Items
          </Link>

          <Link
            href="/admin/qr-code"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition"
          >
            <QrCode className="w-4 h-4" />
            QR Code Setup
          </Link>
        </nav>
      </div>

      {/* Action Controls Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <ThemeToggle />
        <a
          href={`/menu/${businessSlug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
        >
          <Eye className="w-3.5 h-3.5" />
          Preview Customer Menu
        </a>

        <form action={logout}>
        <button
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-red-400 hover:bg-red-950/30 rounded-lg text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
        </form>
      </div>
    </aside>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Suspense boundary satisfies Next.js 16 dynamic data requirements */}
      <Suspense fallback={
        <aside className="w-full md:w-64 bg-slate-900 text-slate-400 p-6 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </aside>
      }>
        <AdminSidebarContent />
      </Suspense>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
