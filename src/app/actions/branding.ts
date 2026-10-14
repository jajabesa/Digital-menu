
"use server"

import { requireBusinessAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateBranding(formData: FormData) {
  try {
    // Authenticate business administrator
    const { businessId } = await requireBusinessAdmin()

    // Get brand colors
    const primaryColor =
      (formData.get("primaryColor") as string) || "#0f172a"

    const secondaryColor =
      (formData.get("secondaryColor") as string) || "#f8fafc"

    const accentColor =
      (formData.get("accentColor") as string) || "#e2e8f0"

    // Get logo and cover image URLs
    // Supports external URLs and locally uploaded images
    const logoUrl =
      (formData.get("logoUrl") as string)?.trim() || ""

    const coverImageUrl =
      (formData.get("coverImageUrl") as string)?.trim() || ""

    // Validate HEX colors
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

    if (
      !hexRegex.test(primaryColor) ||
      !hexRegex.test(secondaryColor) ||
      !hexRegex.test(accentColor)
    ) {
      return {
        error: "Please enter valid HEX color codes (e.g. #0f172a).",
      }
    }

    // Validate external and uploaded image URLs
    function isValidImageUrl(url: string) {
      if (!url) return true

      // Allow only files in this business's upload folder
      const localPrefix = `/uploads/branding/${businessId}/`

      if (url.startsWith(localPrefix)) {
        const filename = url.slice(localPrefix.length)

        return /^(logo|cover)-[0-9a-f-]+\.(jpg|png|webp)$/i.test(
          filename
        )
      }

      // Allow external HTTPS image URLs
      try {
        const parsed = new URL(url)

        return (
          parsed.protocol === "https:" &&
          Boolean(parsed.hostname) &&
          !parsed.username &&
          !parsed.password
        )
      } catch {
        return false
      }
    }

    if (!isValidImageUrl(logoUrl)) {
      return {
        error: "Please provide a valid logo image URL.",
      }
    }

    if (!isValidImageUrl(coverImageUrl)) {
      return {
        error: "Please provide a valid cover image URL.",
      }
    }

    // Save branding settings in PostgreSQL
    await prisma.branding.upsert({
      where: {
        businessId,
      },

      update: {
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
      },

      create: {
        businessId,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
      },
    })

    // Refresh branding and dashboard
    revalidatePath("/admin/branding")
    revalidatePath("/admin/dashboard")

    // Refresh public menu pages
    revalidatePath("/menu/[slug]", "page")

    return {
      success: "Brand identity updated successfully!",
    }
  } catch (err: unknown) {
    console.error("Branding Update Error:", err)

    return {
      error:
        err instanceof Error
          ? err.message
          : "Failed to update brand settings.",
    }
  }
}
