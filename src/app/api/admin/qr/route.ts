import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { businessId } = await requireBusinessAdmin()

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        menus: {
          select: { id: true, name: true, status: true },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}