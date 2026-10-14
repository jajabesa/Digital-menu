
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[LOGIN DEBUG] Missing credentials")
          return null
        }

        const email = String(credentials.email).trim().toLowerCase()
        const password = String(credentials.password)

        const user = await prisma.user.findUnique({
          where: { email },
          include: { business: true },
        })

        if (!user) {
          console.log("[LOGIN DEBUG] User not found:", email)
          return null
        }

        if (!user.passwordHash) {
          console.log("[LOGIN DEBUG] Password hash missing:", email)
          return null
        }

        console.log("[LOGIN DEBUG] User found:", {
          email: user.email,
          role: user.role,
          businessId: user.businessId,
          businessActive: user.business?.isActive ?? null,
        })

        // Platform admins do not require an active business.
        // Business users linked to an inactive business cannot log in.
        if (
          user.role !== "PLATFORM_ADMIN" &&
          user.business &&
          !user.business.isActive
        ) {
          console.log("[LOGIN DEBUG] Business is inactive")
          return null
        }

        const isValid = await bcrypt.compare(
          password,
          user.passwordHash
        )

        console.log("[LOGIN DEBUG] Password valid:", isValid)

        if (!isValid) {
          console.log("[LOGIN DEBUG] Invalid password")
          return null
        }

        console.log("[LOGIN DEBUG] Login successful:", {
          email: user.email,
          role: user.role,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessId: user.businessId,
          businessSlug: user.business?.slug ?? null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.businessId = (user as any).businessId
        token.businessSlug = (user as any).businessSlug
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).businessId = token.businessId
        ;(session.user as any).businessSlug = token.businessSlug
      }

      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },
})
