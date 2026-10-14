"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerBusiness(formData: FormData) {
  try {
    const businessName = formData.get("businessName") as string
    const businessType = formData.get("businessType") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string

    if (!businessName || !email || !password || !businessType) {
      return { error: "Please fill in all required fields." }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "An account with this email already exists." }
    }

    // Create unique slug (e.g., "Grand Hotel" -> "grand-hotel")
    let slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const existingSlug = await prisma.business.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Atomic transaction: Create Business, User, and default Branding
    const newBusiness = await prisma.business.create({
      data: {
        name: businessName,
        slug,
        type: businessType,
        email,
        phone,
        branding: {
          create: {
            primaryColor: "#0f172a",   // Default Slate Dark
            secondaryColor: "#f8fafc", // Default Soft Light
            accentColor: "#e2e8f0"
          }
        },
        users: {
          create: {
            email,
            passwordHash,
            name: `${businessName} Admin`,
            role: "BUSINESS_ADMIN"
          }
        }
      }
    })

    return { success: true, slug: newBusiness.slug }
  } catch (err: any) {
    console.error("Registration Error:", err)
    return { error: err.message || "Failed to create business account." }
  }
}