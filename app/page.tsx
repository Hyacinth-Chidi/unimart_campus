import Link from "next/link"
import Image from "next/image"
import prisma from "@/lib/prisma"

import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { Badge } from "@/components/ui/badge"
import { buttonVariants, Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowRightIcon,
  MessageCircleMoreIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StoreIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  PackageOpenIcon,
} from "lucide-react"

import { HomeSearch } from "@/components/common/home-search"

const footerColumns = [
  {
    title: "Marketplace",
    links: ["Browse Listings", "Sell an Item", "Campus Categories"],
  },
  {
    title: "Account",
    links: ["Log In", "Sign Up", "Profile Settings"],
  },
  {
    title: "Safety",
    links: ["Report a Listing", "Community Rules", "Verification"],
  },
]

export const dynamic = "force-dynamic"

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " mins ago"
  
  return "just now"
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams
  const query = searchParams.q || ""
  const categoryId = searchParams.category || ""

  const whereClause: any = {
    status: "ACTIVE",
  }

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  if (categoryId) {
    whereClause.categoryId = categoryId
  }

  const [categories, listings] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.listing.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 24, // Limit to 24 for the home page
      include: {
        category: true,
      }
    })
  ])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
        <Container className="flex min-h-16 items-center justify-between gap-(--spacing-base)">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary flex items-center gap-2">
              <StoreIcon className="size-5" />
              Unimart
            </Link>
          </div>
          <div className="flex items-center gap-(--spacing-sm)">
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
              Dashboard
            </Link>
            <Link href="/dashboard/listings/new" className={buttonVariants()}>
              Sell Item
            </Link>
          </div>
        </Container>
      </header>

      {/* HERO SECTION */}
      <Section className="relative overflow-hidden pt-24 pb-16 border-b bg-muted/10">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-primary blur-[100px] rounded-full mix-blend-multiply" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent blur-[100px] rounded-full mix-blend-multiply" />
        </div>

        <div className="relative flex flex-col items-center text-center gap-(--spacing-xl)">
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
            <SparklesIcon className="size-4 mr-2" />
            The exclusive marketplace for your campus
          </Badge>

          <div className="space-y-(--spacing-md) max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Buy and sell campus essentials, <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">effortlessly.</span>
            </h1>
          </div>

          <HomeSearch />
          
          <div className="flex flex-wrap items-center justify-center gap-(--spacing-base) text-sm font-medium text-muted-foreground mt-4">
            <span className="flex items-center"><ShieldCheckIcon className="size-4 mr-1 text-primary"/> Verified Students</span>
            <span className="text-border">•</span>
            <span className="flex items-center"><MessageCircleMoreIcon className="size-4 mr-1 text-primary"/> Direct WhatsApp Info</span>
            <span className="text-border">•</span>
            <span className="flex items-center"><StoreIcon className="size-4 mr-1 text-primary"/> No Listing Fees</span>
          </div>
        </div>
      </Section>

      {/* CATEGORY FILTERS */}
      <div className="border-b bg-background sticky top-16 z-40">
        <Container>
          <div className="flex overflow-x-auto py-3 gap-2 no-scrollbar">
            <Link 
              href="/"
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !categoryId 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Items
            </Link>
            {categories.map(cat => (
              <Link 
                key={cat.id}
                href={`/?category=${cat.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  categoryId === cat.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {/* FEATURED LISTINGS */}
      <Section className="py-16 flex-1">
        <div className="flex items-center justify-between mb-(--spacing-lg)">
          <h2 className="text-2xl font-bold tracking-tight">
            {query ? `Search results for "${query}"` : categoryId ? "Category Results" : "Fresh on Campus"}
          </h2>
          <span className="text-muted-foreground text-sm font-medium">
            {listings.length} items found
          </span>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-(--spacing-md)">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 h-full">
                  <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center">
                    {listing.images && listing.images.length > 0 ? (
                      <Image 
                        src={listing.images[0]} 
                        alt={listing.title}
                        fill
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <PackageOpenIcon className="size-10 text-muted-foreground/30" />
                    )}
                    <Badge className="absolute top-3 right-3 bg-background/95 text-foreground hover:bg-background backdrop-blur-sm border-none shadow-sm font-medium">
                      {listing.condition === "USED_LIKE_NEW" ? "Like New" : listing.condition === "USED_FAIR" ? "Fair" : "New"}
                    </Badge>
                  </div>
                  <CardContent className="p-(--spacing-md) flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
                    </div>
                    <p className="text-lg font-bold">₦{Number(listing.price).toLocaleString()}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2">
                      <span className="flex items-center gap-1"><MapPinIcon className="size-3"/> {listing.location || "Campus"}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="size-3"/> {formatTimeAgo(listing.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border rounded-xl bg-muted/10 border-dashed">
            <PackageOpenIcon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or category filters.</p>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Clear Filters
            </Link>
          </div>
        )}
      </Section>

      <footer className="border-t bg-muted/20 py-16 mt-auto">
        <Container className="space-y-(--spacing-lg)">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xl font-bold text-foreground">
              <StoreIcon className="size-5 text-primary" />
              <span>Unimart</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              A focused marketplace for campus trade, built with Next.js, shadcn/ui, and Tailwind CSS.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-(--spacing-lg) pt-8 border-t border-border/50">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {column.links.map((item) => (
                    <li key={item}>
                      <Link href="#" className="hover:text-primary transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-border/50 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Campus Marketplace. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </main>
  )
}
