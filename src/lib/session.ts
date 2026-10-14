import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connection } from "next/server"

export async function requireBusinessAdmin() {
  // Signals dynamic execution to Next.js 16, resolving crypto/auth prerender errors
  await connection()

  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  const role = (session.user as any).role

  // CRITICAL: If the user is a Platform Admin, bypass tenant checks and redirect to platform dashboard
  if (role === "PLATFORM_ADMIN") {
    redirect("/platform/dashboard")
  }

  const businessId = (session.user as any).businessId
  const businessSlug = (session.user as any).businessSlug

  if (!businessId) {
    redirect("/login?error=UnauthorizedTenant")
  }

  return {
    user: session.user,
    businessId: businessId as string,
    businessSlug: businessSlug as string,
  }
}

export async function requirePlatformAdmin() {
  await connection()
  const session = await auth()

  if (!session?.user || (session.user as any).role !== "PLATFORM_ADMIN") {
    throw new Error("Forbidden")
  }

  return { user: session.user }
}
