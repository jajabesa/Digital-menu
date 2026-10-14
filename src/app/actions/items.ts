"use server"

import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createMenuItem(formData: FormData) {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()

    const categoryId = formData.get("categoryId") as string
    const name = formData.get("name") as string
    const nameAmharic = formData.get("nameAmharic") as string
    const nameOromo = formData.get("nameOromo") as string
    const description = formData.get("description") as string
    const descAmharic = formData.get("descAmharic") as string
    const descOromo = formData.get("descOromo") as string
    const priceStr = formData.get("price") as string
    const currency = (formData.get("currency") as string) || "ETB"
    const imageUrl = formData.get("imageUrl") as string

    if (!categoryId || !name || !priceStr) {
      return { error: "Category, item name, and price are required." }
    }

    const price = parseFloat(priceStr)
    if (isNaN(price) || price < 0) {
      return { error: "Please enter a valid price." }
    }

    const category = await prisma.category.findFirst({ where: { id: categoryId, businessId }, select: { id: true } })
    if (!category) return { error: "Selected category was not found." }

    await prisma.menuItem.create({
      data: {
        businessId,
        categoryId,
        name,
        nameAmharic: nameAmharic || null,
        nameOromo: nameOromo || null,
        description: description || null,
        descAmharic: descAmharic || null,
        descOromo: descOromo || null,
        price,
        currency,
        imageUrl: imageUrl || null,
        isAvailable: true,
      },
    })

    revalidatePath("/admin/items")
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: "Menu item added successfully!" }
  } catch (err: any) {
    console.error("Create Item Error:", err)
    return { error: err.message || "Failed to create menu item." }
  }
}

export async function updateMenuItem(formData: FormData) {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()

    const itemId = formData.get("id") as string
    const categoryId = formData.get("categoryId") as string
    const name = String(formData.get("name") || "").trim()
    const nameAmharic = String(formData.get("nameAmharic") || "").trim()
    const nameOromo = String(formData.get("nameOromo") || "").trim()
    const description = String(formData.get("description") || "").trim()
    const descAmharic = String(formData.get("descAmharic") || "").trim()
    const descOromo = String(formData.get("descOromo") || "").trim()
    const price = Number(formData.get("price"))
    const currency = String(formData.get("currency") || "ETB").trim()
    const imageUrl = String(formData.get("imageUrl") || "").trim()

    if (!itemId || !name || !Number.isFinite(price) || price < 0) {
      return { error: "Item ID, name, and valid price are required." }
    }

    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, businessId }, select: { id: true } })
      if (!category) return { error: "Selected category was not found." }
    }

    const result = await prisma.menuItem.updateMany({
      where: { id: itemId, businessId },
      data: {
        categoryId: categoryId || undefined,
        name,
        nameAmharic: nameAmharic || null,
        nameOromo: nameOromo || null,
        description: description || null,
        descAmharic: descAmharic || null,
        descOromo: descOromo || null,
        price,
        currency,
        imageUrl: imageUrl || null,
      },
    })

    if (!result.count) return { error: "Menu item not found or unauthorized." }

    revalidatePath("/admin/items")
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: "Menu item updated successfully!" }
  } catch (err: any) {
    console.error("Update Item Error:", err)
    return { error: err.message || "Failed to update item." }
  }
}

export async function toggleItemAvailability(itemId: string, currentAvailability: boolean) {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()

    await prisma.menuItem.updateMany({
      where: { id: itemId, businessId },
      data: { isAvailable: !currentAvailability },
    })

    revalidatePath("/admin/items")
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: "Availability updated!" }
  } catch (err: any) {
    return { error: err.message || "Failed to update availability." }
  }
}

export async function deleteMenuItem(itemId: string) {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()

    await prisma.menuItem.deleteMany({
      where: { id: itemId, businessId },
    })

    revalidatePath("/admin/items")
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: "Menu item deleted." }
  } catch (err: any) {
    return { error: err.message || "Failed to delete item." }
  }
}

export async function duplicateMenuItem(itemId: string) {
  try {
    const { businessId, businessSlug } = await requireBusinessAdmin()
    const item = await prisma.menuItem.findFirst({ where: { id: itemId, businessId } })
    if (!item) return { error: "Menu item not found." }
    const { id, createdAt, updatedAt, ...data } = item
    await prisma.menuItem.create({ data: { ...data, name: `${item.name} (Copy)`, isAvailable: false } })
    revalidatePath("/admin/items")
    revalidatePath("/admin/menus")
    revalidatePath(`/menu/${businessSlug}`)
    return { success: "Item duplicated as unavailable." }
  } catch (err: any) { return { error: err.message || "Failed to duplicate item." } }
}
