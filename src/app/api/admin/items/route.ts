import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { businessId } = await requireBusinessAdmin()

    const categories = await prisma.category.findMany({
      where: { businessId },
      include: {
        menu: { select: { name: true } },
        items: { orderBy: { createdAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(categories)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}