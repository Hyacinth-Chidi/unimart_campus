import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  EyeIcon,
  StoreIcon
} from "lucide-react"

import { ListingGallery } from "./listing-gallery"
import { WhatsAppButton } from "./whatsapp-button"
import { ReportModal } from "./report-modal"

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

export default async function ListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  const isLoggedIn = !!session?.user

  // Fetch listing and increment view count
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      owner: {
        select: {
          name: true,
          department: true,
          profileImage: true,
          createdAt: true,
          phoneNumber: true,
          isVerified: true,
        }
      }
    }
  })

  // If not found or soft-removed (and user is not admin/owner), show 404
  if (!listing) {
    notFound()
  }
  
  const isOwner = session?.user?.id === listing.ownerId
  const isAdmin = session?.user?.role === "ADMIN"

  if (listing.status === "REMOVED" && !isOwner && !isAdmin) {
    notFound()
  }

  // Increment view count in background if it's an active listing and not the owner viewing
  if (listing.status === "ACTIVE" && !isOwner) {
    prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } }
    }).catch(console.error)
  }

  const ownerInitials = listing.owner.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const conditionDisplay = {
    NEW: "Brand New",
    USED_LIKE_NEW: "Used - Like New",
    USED_FAIR: "Used - Fair"
  }[listing.condition]

  return (
    <main className="min-h-screen bg-muted/20 flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <StoreIcon className="size-5" />
            Unimart
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Log In
              </Link>
            )}
          </div>
        </Container>
      </header>

      <Container className="py-8 flex-1">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeftIcon className="size-4 mr-1" />
          Back to listings
        </Link>

        {listing.status === "SOLD" && (
          <div className="bg-secondary text-secondary-foreground p-4 rounded-xl mb-6 flex items-center justify-center font-medium border border-border/50">
            This item has been sold and is no longer available.
          </div>
        )}

        {listing.status === "REMOVED" && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl mb-6 flex items-center justify-center font-medium border border-destructive/20">
            This listing has been removed by moderators.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="lg:col-span-7">
            <ListingGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4 bg-background p-6 rounded-2xl border shadow-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {listing.category.name}
                </Badge>
                <Badge variant="secondary">
                  {conditionDisplay}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight leading-tight">{listing.title}</h1>
              <p className="text-4xl font-bold text-primary">₦{Number(listing.price).toLocaleString()}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><ClockIcon className="size-4"/> Posted {formatTimeAgo(listing.createdAt)}</span>
                <span className="flex items-center gap-1.5"><MapPinIcon className="size-4"/> {listing.location || "Campus"}</span>
                <span className="flex items-center gap-1.5"><EyeIcon className="size-4"/> {listing.viewCount} views</span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-background p-6 rounded-2xl border shadow-sm space-y-6">
              <h3 className="font-semibold text-lg">About the Seller</h3>
              
              <div className="flex items-center gap-4">
                <Avatar className="size-14 border-2 border-muted">
                  <AvatarImage src={listing.owner.profileImage || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {ownerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{listing.owner.name}</span>
                    {listing.owner.isVerified && (
                      <span title="Verified Student">
                        <ShieldCheckIcon className="size-4 text-green-500" />
                      </span>
                    )}
                  </div>
                  {listing.owner.department && (
                    <span className="text-sm text-muted-foreground">{listing.owner.department}</span>
                  )}
                  <span className="text-xs text-muted-foreground mt-0.5">
                    Joined {new Date(listing.owner.createdAt).getFullYear()}
                  </span>
                </div>
              </div>

              {listing.status === "ACTIVE" && !isOwner && (
                <div className="pt-2">
                  <WhatsAppButton 
                    sellerPhone={listing.owner.phoneNumber}
                    sellerName={listing.owner.name}
                    listingTitle={listing.title}
                    listingPrice={Number(listing.price)}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              )}

              {isOwner && (
                <div className="pt-2">
                  <Link href={`/dashboard/listings/${listing.id}/edit`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                    Edit Your Listing
                  </Link>
                </div>
              )}
            </div>

            {/* Report Section */}
            {!isOwner && (
              <div className="pt-4 flex justify-center">
                <ReportModal listingId={listing.id} isLoggedIn={isLoggedIn} />
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  )
}
