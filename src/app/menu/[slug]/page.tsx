
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import MenuClientView from "./MenuClientView"

export const instant = false

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const business = await prisma.business.findFirst({
    where: { slug, isActive: true },
    include: {
      branding: true,
      menus: {
        where: { status: "PUBLISHED" },
        include: {
          categories: {
            where: { isActive: true },
            include: {
              items: {
                where: { isAvailable: true },
                orderBy: { createdAt: "desc" },
              },
            },
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!business) {
    notFound()
  }

  const branding = business.branding || {
    primaryColor: "#0f172a",
    secondaryColor: "#f8fafc",
    accentColor: "#e2e8f0",
    logoUrl: null,
    coverImageUrl: null,
  }

  // Convert Prisma Decimal prices into serializable strings.
  const menus = business.menus.map((menu) => ({
    ...menu,
    categories: menu.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        price: item.price.toString(),
      })),
    })),
  }))

  // Convert branding and business records into plain objects
  // that can safely be passed to a Client Component.
  const safeBusiness = {
    ...business,
    branding: undefined,
    menus: undefined,
  }

  return (
    <MenuClientView
      business={safeBusiness}
      branding={branding}
      menus={menus}
    />
  )
}
