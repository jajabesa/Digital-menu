import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { businessId } = await requireBusinessAdmin()

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        type: true,
        phone: true,
        email: true,
        address: true,
        description: true,
      },
    })

    return NextResponse.json(business)
  } catch (err: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}