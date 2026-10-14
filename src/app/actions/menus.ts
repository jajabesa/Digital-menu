"use server"

import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- MENU ACTIONS ---

export async function createMenu(formData: FormData) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const initialItemName = String(formData.get("initialItemName") || "").trim()
    const initialItemPrice = String(formData.get("initialItemPrice") || "").trim()
    const initialItemCurrency = String(formData.get("initialItemCurrency") || "ETB").trim()
    const initialItemImage = String(formData.get("initialItemImage") || "").trim()
    const initialItemDescription = String(formData.get("initialItemDescription") || "").trim()

    if (!name) return { error: "Menu name is required." }
    if (initialItemName && (!initialItemPrice || !Number.isFinite(Number(initialItemPrice)) || Number(initialItemPrice) < 0)) {
      return { error: "Enter a valid price for the first menu item." }
    }

    await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: { businessId, name, description: description || null, status: "DRAFT" },
      })
      if (initialItemName) {
        const category = await tx.category.create({
          data: { businessId, menuId: menu.id, name: "Main" },
        })
        await tx.menuItem.create({
          data: {
            businessId,
            categoryId: category.id,
            name: initialItemName,
            description: initialItemDescription || null,
            price: Number(initialItemPrice),
            currency: initialItemCurrency || "ETB",
            imageUrl: initialItemImage || null,
          },
        })
      }
    })

    revalidatePath("/admin/menus")
    return { success: "Menu created successfully!" }
  } catch (err: any) {
    return { error: err.message || "Failed to create menu." }
  }
}

export async function toggleMenuStatus(menuId: string, currentStatus: "DRAFT" | "PUBLISHED") {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()
    const newStatus = currentStatus === "DRAFT" ? "PUBLISHED" : "DRAFT"

    await prisma.menu.updateMany({
      where: { id: menuId, businessId },
      data: { status: newStatus },
    })

    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: `Menu ${newStatus.toLowerCase()} successfully!` }
  } catch (err: any) {
    return { error: err.message || "Failed to toggle menu status." }
  }
}

export async function deleteMenu(menuId: string) {
  try {
    const { businessId } = await requireBusinessAdmin()

    await prisma.menu.deleteMany({
      where: { id: menuId, businessId },
    })

    revalidatePath("/admin/menus")
    return { success: "Menu deleted." }
  } catch (err: any) {
    return { error: err.message || "Failed to delete menu." }
  }
}

// --- CATEGORY ACTIONS ---

export async function createCategory(formData: FormData) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const menuId = formData.get("menuId") as string
    const name = formData.get("name") as string

    if (!menuId || !name) return { error: "Menu selection and category name are required." }

    const menu = await prisma.menu.findFirst({ where: { id: menuId, businessId }, select: { id: true } })
    if (!menu) return { error: "Selected menu was not found." }

    await prisma.category.create({
      data: {
        businessId,
        menuId,
        name,
      },
    })

    revalidatePath("/admin/menus")
    return { success: "Category added successfully!" }
  } catch (err: any) {
    return { error: err.message || "Failed to create category." }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const { businessId } = await requireBusinessAdmin()

    await prisma.category.deleteMany({
      where: { id: categoryId, businessId },
    })

    revalidatePath("/admin/menus")
    return { success: "Category deleted." }
  } catch (err: any) {
    return { error: err.message || "Failed to delete category." }
  }
}

export async function updateMenu(menuId: string, formData: FormData) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const name = String(formData.get("name") || "").trim()
    const description = String(formData.get("description") || "").trim()
    if (!name) return { error: "Menu name is required." }
    const result = await prisma.menu.updateMany({ where: { id: menuId, businessId }, data: { name, description: description || null } })
    if (!result.count) return { error: "Menu not found." }
    revalidatePath("/admin/menus")
    return { success: "Menu updated." }
  } catch (err: any) { return { error: err.message || "Failed to update menu." } }
}

export async function duplicateMenu(menuId: string) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const menu = await prisma.menu.findFirst({ where: { id: menuId, businessId }, include: { categories: { include: { items: true } } } })
    if (!menu) return { error: "Menu not found." }
    await prisma.$transaction(async (tx) => {
      const copy = await tx.menu.create({ data: { businessId, name: `${menu.name} (Copy)`, description: menu.description, status: "DRAFT" } })
      for (const category of menu.categories) {
        const categoryCopy = await tx.category.create({ data: { businessId, menuId: copy.id, name: category.name, imageUrl: category.imageUrl, displayOrder: category.displayOrder, isActive: category.isActive } })
        if (category.items.length) await tx.menuItem.createMany({ data: category.items.map(({ id, createdAt, updatedAt, categoryId, ...item }) => ({ ...item, businessId, categoryId: categoryCopy.id })) })
      }
    })
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${(await requireBusinessAdmin()).businessSlug}`)
    return { success: "Draft menu duplicated." }
  } catch (err: any) { return { error: err.message || "Failed to duplicate menu." } }
}

export async function updateCategory(categoryId: string, formData: FormData) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const name = String(formData.get("name") || "").trim()
    if (!name) return { error: "Category name is required." }
    const result = await prisma.category.updateMany({ where: { id: categoryId, businessId }, data: { name } })
    if (!result.count) return { error: "Category not found." }
    revalidatePath("/admin/menus")
    return { success: "Category updated." }
  } catch (err: any) { return { error: err.message || "Failed to update category." } }
}

export async function toggleCategory(categoryId: string, currentIsActive: boolean) {
  try {
    const { businessId } = await requireBusinessAdmin()
    const result = await prisma.category.updateMany({ where: { id: categoryId, businessId }, data: { isActive: !currentIsActive } })
    if (!result.count) return { error: "Category not found." }
    revalidatePath("/admin/menus")
    return { success: "Category visibility updated." }
  } catch (err: any) { return { error: err.message || "Failed to update category." } }
}
