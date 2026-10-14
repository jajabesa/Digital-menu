import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  
  const email = "admin@platform.com"
  const password = "adminPassword123!"

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "PLATFORM_ADMIN",
      name: "Super Platform Admin",
    },
    create: {
      email,
      passwordHash,
      name: "Super Platform Admin",
      role: "PLATFORM_ADMIN",
    },
  })

  console.log(`[SEED SUCCESS] Platform Admin ready: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error("[SEED ERROR]", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })