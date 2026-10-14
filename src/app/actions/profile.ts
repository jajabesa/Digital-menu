"use server"

import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateBusinessProfile(formData: FormData) {
  try {
    const { businessId } = await requireBusinessAdmin()

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const description = formData.get("description") as string

    if (!name || !type) {
      return { error: "Business name and business type are required." }
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        type,
        phone,
        email,
        address,
        description,
      },
    })

    revalidatePath("/admin/profile")
    revalidatePath("/admin/dashboard")
    return { success: "Business profile updated successfully!" }
  } catch (err: any) {
    console.error("Profile Update Error:", err)
    return { error: err.message || "Failed to update profile." }
  }
}