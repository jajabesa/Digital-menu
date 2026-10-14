export const instant = false

import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { UtensilsCrossed, FolderTree, Layers, ExternalLink } from "lucide-react"

export default async function DashboardPage() {
  const { businessId, businessSlug } = await requireBusinessAdmin()

  // Fetch count aggregations isolated to this business tenant
  const [menusCount, categoriesCount, itemsCount, availableItemsCount] = await Promise.all([
    prisma.menu.count({ where: { businessId } }),
    prisma.category.count({ where: { businessId } }),
    prisma.menuItem.count({ where: { businessId } }),
    prisma.menuItem.count({ where: { businessId, isAvailable: true } }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500">
          Manage your hospitality digital presence and monitor menu items.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Active Menus</span>
            <UtensilsCrossed className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{menusCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Categories</span>
            <FolderTree className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{categoriesCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Items</span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{itemsCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Available Items</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{availableItemsCount}</p>
        </div>
      </div>

      {/* Quick Access Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Public Digital Menu URL</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Your dynamic menu is live at <code className="text-slate-200 bg-slate-800 px-2 py-0.5 rounded">/menu/{businessSlug}</code>
          </p>
        </div>
        <a
          href={`/menu/${businessSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-sm font-semibold transition"
        >
          View Public Menu <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}