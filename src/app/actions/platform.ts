"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requirePlatformAdmin } from "@/lib/session"

export async function toggleBusinessStatus(businessId: string, currentIsActive: boolean) {
  try {
    await requirePlatformAdmin()
    await prisma.business.update({
      where: { id: businessId },
      data: { isActive: !currentIsActive },
    })

    revalidatePath("/platform/dashboard")
    return { success: `Business ${!currentIsActive ? "activated" : "deactivated"} successfully.` }
  } catch (err: any) {
    return { error: err.message || "Failed to update business status." }
  }
}

export async function deleteBusiness(businessId: string) {
  try {
    await requirePlatformAdmin()
    await prisma.business.delete({
      where: { id: businessId },
    })

    revalidatePath("/platform/dashboard")
    return { success: "Business deleted successfully." }
  } catch (err: any) {
    return { error: err.message || "Failed to delete business." }
  }
}

export async function updateUserRole(userId: string, newRole: "PLATFORM_ADMIN" | "BUSINESS_ADMIN" | "BUSINESS_STAFF") {
  try {
    await requirePlatformAdmin()
    if (!Object.values({ PLATFORM_ADMIN: "PLATFORM_ADMIN", BUSINESS_ADMIN: "BUSINESS_ADMIN", BUSINESS_STAFF: "BUSINESS_STAFF" }).includes(newRole)) {
      return { error: "Invalid role." }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath("/platform/dashboard")
    return { success: "User role updated successfully." }
  } catch (err: any) {
    return { error: err.message || "Failed to update user role." }
  }
}
