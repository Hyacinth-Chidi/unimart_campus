import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { Container } from "@/components/layout/container"
import { buttonVariants, Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboardIcon,
  PackageIcon,
  UserIcon,
  LogOutIcon,
  PlusIcon,
  StoreIcon,
  MenuIcon,
} from "lucide-react"
import { logout } from "@/actions/auth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/listings", label: "My Listings", icon: PackageIcon },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const sidebarNavItems = (
    <>
      {navItems.map((item) => (
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
      <form action={async () => { "use server"; await logout(); redirect("/login") }}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive whitespace-nowrap active:scale-[0.98]"
        >
          <LogOutIcon className="size-4.5" />
          Log Out
        </button>
      </form>
    </>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                      <StoreIcon className="size-5" />
                      Unimart
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1.5">
                    {sidebarNavItems}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
            
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
              <StoreIcon className="size-5" />
              <span className="hidden sm:inline-block">Unimart</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/listings/new" className={buttonVariants({ size: "sm" })}>
              <PlusIcon className="size-4 mr-1.5" />
              New Listing
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
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
            <div className="sticky top-24 rounded-xl border bg-card text-card-foreground shadow-sm p-3">
              <nav className="flex flex-col gap-1.5">
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
