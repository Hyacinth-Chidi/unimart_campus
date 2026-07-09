import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isVerified: boolean
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    isVerified?: boolean
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    isVerified?: boolean
    role?: string
  }
}
