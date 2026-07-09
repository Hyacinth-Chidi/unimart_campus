import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

// Routes that require authentication
const protectedPrefixes = ["/dashboard", "/admin"]
// Routes only accessible when NOT logged in
const authRoutes = ["/login", "/signup", "/admin/login"]

export default async function proxy(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  
  // Custom logic for protected routes to exempt /admin/login
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix) && pathname !== "/admin/login"
  )

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !session) {
    // If they were trying to reach admin, redirect to admin login
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/admin/login", req.nextUrl)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    const loginUrl = new URL("/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  // Block non-admin users from /admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
}
