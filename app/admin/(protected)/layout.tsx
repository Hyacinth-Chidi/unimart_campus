import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboardIcon,
  UsersIcon,
  PackageIcon,
  LogOutIcon,
  TagsIcon,
  AlertTriangleIcon,
  ShieldIcon,
  StoreIcon,
  MenuIcon
} from "lucide-react"
import { logout } from "@/actions/auth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/categories", label: "Categories", icon: TagsIcon },
  { href: "/admin/listings", label: "Listings", icon: PackageIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangleIcon },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A"

  const sidebarNavItems = (
    <>
      <div className="px-3 pb-4 pt-1 mb-2 border-b">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Management</h3>
      </div>
      {adminNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/5 hover:text-primary whitespace-nowrap active:scale-[0.98]"
        >
          <item.icon className="size-4.5" />
          {item.label}
        </Link>
      ))}
      <div className="h-px bg-border my-2" />
      <form action={async () => { "use server"; await logout(); redirect("/admin/login") }}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive whitespace-nowrap active:scale-[0.98]"
        >
          <LogOutIcon className="size-4.5" />
          Secure Log Out
        </button>
      </form>
    </>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <Container className="page-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar */}
            <div className="lg:hidden flex items-center">
              <Sheet>
                <SheetTrigger render={
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <MenuIcon className="size-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                } />
                <SheetContent side="left" className="w-72">
                  <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="flex items-center gap-2 text-lg font-bold text-primary">
                      <ShieldIcon className="size-5" />
                      Unimart Admin
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1.5">
                    {sidebarNavItems}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-primary">
              <ShieldIcon className="size-5" />
              <span className="hidden sm:inline-block">Unimart Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
             <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 transition-colors">
              <StoreIcon className="size-4" />
              View Store
            </Link>
            <div className="flex items-center gap-2 border-l pl-4">
              <Avatar className="size-8 border border-primary/20">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {session.user.name}
              </span>
            </div>
          </div>
        </Container>
      </header>

      <Container className="page-container py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Sidebar navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-xl border-2 border-primary/10 bg-card text-card-foreground shadow-sm p-3">
              <nav className="flex flex-col gap-1.5 pb-2 lg:pb-0">
                {sidebarNavItems}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </Container>
    </div>
  )
}
