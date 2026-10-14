import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePlatformAdmin } from "@/lib/session"

export async function GET() {
  try {
    await requirePlatformAdmin()
    const [businesses, users, totalMenusCount, publishedMenusCount] = await Promise.all([
      prisma.business.findMany({
        include: {
          _count: {
            select: { menus: true, items: true, users: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        include: {
          business: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.menu.count(),
      prisma.menu.count({ where: { status: "PUBLISHED" } }),
    ])

    const totalBusinesses = businesses.length
    const activeBusinesses = businesses.filter((b) => b.isActive).length
    const inactiveBusinesses = totalBusinesses - activeBusinesses
    const totalUsers = users.length

    // Generate activity logs derived from recent database registrations and updates
    const recentBusinesses = businesses.slice(0, 5).map((b) => ({
      id: `b-${b.id}`,
      type: "BUSINESS_REGISTERED",
      message: `New business "${b.name}" (${b.type}) registered.`,
      timestamp: b.createdAt,
    }))

    const recentUsers = users.slice(0, 5).map((u) => ({
      id: `u-${u.id}`,
      type: "USER_JOINED",
      message: `User "${u.name || u.email}" joined as ${u.role}.`,
      timestamp: u.createdAt,
    }))

    const activityLogs = [...recentBusinesses, ...recentUsers].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      stats: {
        totalBusinesses,
        activeBusinesses,
        inactiveBusinesses,
        totalUsers,
        totalMenus: totalMenusCount,
        publishedMenus: publishedMenusCount,
      },
      businesses,
      users,
      activityLogs,
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
