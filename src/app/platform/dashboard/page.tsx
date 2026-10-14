
"use client"

import { useState, useEffect } from "react"
import {
  toggleBusinessStatus,
  deleteBusiness,
  updateUserRole,
} from "@/app/actions/platform"
import { logout } from "@/app/actions/auth"
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Settings,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Trash2,
  Menu as MenuIcon,
  X,
  Search,
  Sun,
  Moon,
  Laptop,
} from "lucide-react"

type Tab = "dashboard" | "businesses" | "users" | "activity" | "settings"
type Theme = "light" | "dark" | "system"

export default function PlatformDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [theme, setTheme] = useState<Theme>("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme =
      (localStorage.getItem("saas_theme") as Theme) || "system"
    setTheme(savedTheme)
    applyTheme(savedTheme)
    loadData()
  }, [])

  function applyTheme(selectedTheme: Theme) {
    const root = document.documentElement
    root.classList.remove("dark")

    if (selectedTheme === "dark") {
      root.classList.add("dark")
    } else if (selectedTheme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
      if (systemDark) root.classList.add("dark")
    }

    localStorage.setItem("saas_theme", selectedTheme)
  }

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  async function loadData() {
    try {
      const res = await fetch("/api/platform/dashboard")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBusiness(id: string, isActive: boolean) {
    const res = await toggleBusinessStatus(id, isActive)
    if (res.success) loadData()
  }

  async function handleDeleteBusiness(id: string) {
    if (
      !confirm(
        "Are you sure? This action will permanently remove the business and its associated menus."
      )
    ) return

    const res = await deleteBusiness(id)
    if (res.success) loadData()
  }

  async function handleRoleChange(userId: string, role: any) {
    const res = await updateUserRole(userId, role)
    if (res.success) loadData()
  }

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[var(--main-bg)] text-[var(--text-primary)] flex flex-col items-center justify-center gap-3 font-semibold text-xs tracking-wide">
        <div className="w-6 h-6 border-2 border-[var(--btn-primary)] border-t-transparent rounded-full animate-spin" />
        LOADING PLATFORM CONTROL HUB...
      </div>
    )
  }

  const filteredBusinesses = data?.businesses.filter(
    (b: any) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = data?.users.filter(
    (u: any) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "businesses", label: "Managed Tenants", icon: Building2 },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "activity", label: "System Audit Trail", icon: Activity },
    { id: "settings", label: "Configuration", icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-[var(--main-bg)] text-[var(--text-primary)] flex flex-col md:flex-row transition-colors duration-200">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 text-slate-300 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-xs block text-white">
              Platform Admin
            </span>
            <span className="text-[10px] text-slate-400">
              Control Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              handleThemeChange(theme === "dark" ? "light" : "dark")
            }
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-300"
            aria-label="Toggle navigation"
          >
            {mobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`${
          mobileSidebarOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 bg-slate-950 text-slate-300 flex-shrink-0 flex-col justify-between md:sticky md:top-0 md:h-screen z-50`}
      >
        <div>
          {/* PLATFORM BRAND */}
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white truncate">
              Platform Admin
            </h2>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
              Enterprise Control Hub
            </span>
          </div>

          {/* NAVIGATION */}
          <nav className="p-4 grid grid-cols-2 gap-1 md:grid-cols-1 md:space-y-1">
            {navigation.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMobileSidebarOpen(false)
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            {[
              { id: "light", label: "Light mode", icon: Sun },
              { id: "dark", label: "Dark mode", icon: Moon },
              { id: "system", label: "System theme", icon: Laptop },
            ].map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    handleThemeChange(option.id as Theme)
                  }
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={theme === option.id}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg transition ${
                    theme === option.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              )
            })}
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-red-400 hover:bg-red-950/30 rounded-lg text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Session
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-4 sm:p-8 lg:p-10 space-y-8 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div>
            <h1 className="text-2xl font-black capitalize tracking-tight">
              {activeTab} Overview
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Real-time database analytics and platform telemetry.
            </p>
          </div>

          {(activeTab === "businesses" || activeTab === "users") && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter database records..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary)] transition shadow-sm"
              />
            </div>
          )}
        </div>

        {/* DASHBOARD METRICS */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {/* TOTAL BUSINESSES */}
              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-2 shadow-sm hover:border-[var(--btn-primary)]/40 transition">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Total Businesses
                </p>
                <p className="text-3xl font-black">
                  {data?.stats.totalBusinesses}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--text-secondary)] font-medium">
                  <span className="inline-flex items-center text-emerald-500 font-bold">
                    {data?.stats.activeBusinesses} Active
                  </span>
                  <span>•</span>
                  <span>
                    {data?.stats.inactiveBusinesses} Inactive
                  </span>
                </div>
              </div>

              {/* REGISTERED USERS */}
              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-2 shadow-sm hover:border-[var(--btn-primary)]/40 transition">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Registered Users
                </p>
                <p className="text-3xl font-black text-[var(--btn-primary)]">
                  {data?.stats.totalUsers}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium pt-1">
                  Platform & Tenant Admins
                </p>
              </div>

              {/* TOTAL MENUS */}
              <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] space-y-2 shadow-sm hover:border-[var(--btn-primary)]/40 transition">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Total Menus
                </p>
                <p className="text-3xl font-black text-purple-500">
                  {data?.stats.totalMenus}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium pt-1">
                  {data?.stats.publishedMenus} Published Menus Live
                </p>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--btn-primary)]" />
                  Recent System Audit Events
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)] font-mono uppercase">
                  Live Telemetry
                </span>
              </div>

              <div className="space-y-2.5">
                {data?.activityLogs.slice(0, 5).map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-[var(--main-bg)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      {log.message}
                    </span>
                    <span className="text-[var(--text-secondary)] text-[10px] font-mono">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MANAGED BUSINESSES */}
        {(activeTab === "dashboard" || activeTab === "businesses") && (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--btn-primary)]" />
                Managed Tenants ({filteredBusinesses?.length ?? 0})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--main-bg)] text-[var(--text-secondary)] uppercase font-extrabold tracking-wider border-b border-[var(--border-color)]">
                    <th className="p-4">Business</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Metrics</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredBusinesses?.map((b: any) => (
                    <tr
                      key={b.id}
                      className="hover:bg-[var(--main-bg)]/40 transition"
                    >
                      <td className="p-4">
                        <div className="font-extrabold text-sm text-[var(--text-primary)]">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                          /menu/{b.slug}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--main-bg)] border border-[var(--border-color)] font-bold text-[11px]">
                          {b.type}
                        </span>
                      </td>

                      <td className="p-4 text-[var(--text-secondary)] font-medium">
                        {b._count.menus} Menus • {b._count.items} Items
                      </td>

                      <td className="p-4">
                        {b.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-500 border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <a
                          href={`/menu/${b.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block p-2 rounded-lg bg-[var(--main-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                          title="Preview Public Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleBusiness(b.id, b.isActive)
                          }
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition border shadow-sm ${
                            b.isActive
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {b.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBusiness(b.id)}
                          className="p-2 rounded-lg bg-[var(--main-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 transition"
                          title="Delete Business"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS & ROLES */}
        {activeTab === "users" && (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[var(--border-color)]">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--btn-primary)]" />
                Platform User Accounts ({filteredUsers?.length ?? 0})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--main-bg)] text-[var(--text-secondary)] uppercase font-extrabold tracking-wider border-b border-[var(--border-color)]">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Assigned Business</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4 text-right">Role Management</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredUsers?.map((u: any) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[var(--main-bg)]/40 transition"
                    >
                      <td className="p-4">
                        <div className="font-extrabold text-[var(--text-primary)]">
                          {u.name || "Unnamed User"}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          {u.email}
                        </div>
                      </td>

                      <td className="p-4 text-[var(--text-secondary)] font-medium">
                        {u.business
                          ? u.business.name
                          : "None (Platform Level)"}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--btn-primary)]/10 text-[var(--btn-primary)] font-extrabold text-[10px] border border-[var(--btn-primary)]/20">
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
                          className="bg-[var(--main-bg)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--btn-primary)] transition shadow-sm cursor-pointer"
                        >
                          <option value="BUSINESS_ADMIN">
                            BUSINESS_ADMIN
                          </option>
                          <option value="BUSINESS_STAFF">
                            BUSINESS_STAFF
                          </option>
                          <option value="PLATFORM_ADMIN">
                            PLATFORM_ADMIN
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACTIVITY LOGS */}
        {activeTab === "activity" && (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Activity className="w-4 h-4 text-[var(--btn-primary)]" />
              Complete System Audit Trail
            </h3>

            <div className="space-y-3">
              {data?.activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 bg-[var(--main-bg)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--text-primary)]">
                      {log.message}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                      Event ID: {log.id}
                    </p>
                  </div>

                  <span className="text-[var(--text-secondary)] text-xs font-mono bg-[var(--card-bg)] px-2.5 py-1 rounded border border-[var(--border-color)]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 space-y-6 max-w-xl shadow-sm">
            <h3 className="text-sm font-extrabold flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Settings className="w-4 h-4 text-[var(--btn-primary)]" />
              System Settings & Environment
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[var(--main-bg)] rounded-xl border border-[var(--border-color)] space-y-1">
                <p className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px]">
                  Platform Engine
                </p>
                <p className="font-semibold text-sm">
                  Next.js 16 (App Router) • Prisma 7 • PostgreSQL
                </p>
              </div>

              <div className="p-4 bg-[var(--main-bg)] rounded-xl border border-[var(--border-color)] space-y-1">
                <p className="text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px]">
                  Multilingual Engine Status
                </p>
                <p className="text-emerald-500 font-bold">
                  English (EN) | Amharic (አማ) | Afan Oromo (ORO) Active
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
