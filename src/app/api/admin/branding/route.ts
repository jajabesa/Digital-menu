import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { businessId } = await requireBusinessAdmin()

    const branding = await prisma.branding.findUnique({
      where: { businessId },
    })

    return NextResponse.json(branding || {
      primaryColor: "#0f172a",
      secondaryColor: "#f8fafc",
      accentColor: "#e2e8f0",
      logoUrl: "",
      coverImageUrl: ""
    })
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}