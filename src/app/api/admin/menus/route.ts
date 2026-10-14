
import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  // Authentication runs when the API is requested,
  // not during static prerendering.
  const { businessId } = await requireBusinessAdmin()

  try {
    const menus = await prisma.menu.findMany({
      where: {
        businessId,
      },
      include: {
        categories: {
          include: {
            items: {
              where: {
                isAvailable: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            _count: {
              select: {
                items: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(menus)
  } catch (error: unknown) {
    console.error("API Menus Database Error:", error)

    return NextResponse.json(
      {
        error: "Failed to load menus.",
      },
      {
        status: 500,
      }
    )
  }
}
