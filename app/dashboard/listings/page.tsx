import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import { getMyListings } from "@/actions/listings"

import { buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, EditIcon, PackageOpenIcon, EyeIcon } from "lucide-react"
import { ListingActions } from "./listing-actions"

const formatPrice = (price: any) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(price))
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active</Badge>
    case "SOLD":
      return <Badge variant="secondary">Sold</Badge>
    case "REMOVED":
      return <Badge variant="destructive">Removed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function MyListingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { listings, error } = await getMyListings()

  if (error) {
    return (
      <div className="p-4 bg-destructive/15 text-destructive rounded-md">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="My Listings"
          description="Manage the items you're selling on Campus Marketplace."
        />
        <Link href="/dashboard/listings/new" className={buttonVariants()}>
          <PlusIcon className="size-4 mr-2" />
          Create Listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-card/50">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PackageOpenIcon className="size-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold">No listings yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            You haven&apos;t posted any items for sale yet. Create your first listing to start selling!
          </p>
          <Link href="/dashboard/listings/new" className={buttonVariants()}>
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className={`object-cover transition-transform group-hover:scale-105 ${listing.status !== "ACTIVE" ? "grayscale opacity-80" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <PackageOpenIcon className="size-10 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(listing.status)}
                </div>
              </div>
              
              <div className="flex flex-col flex-1 p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                  {listing.category.name}
                </div>
                <h3 className="font-bold text-lg leading-tight line-clamp-1 mb-1">
                  {listing.title}
                </h3>
                <div className="font-semibold text-primary mb-3">
                  {formatPrice(listing.price)}
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <EyeIcon className="size-4 mr-1.5" />
                  {listing.viewCount} {listing.viewCount === 1 ? 'view' : 'views'}
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between gap-2">
                  <ListingActions listingId={listing.id} status={listing.status} />
                  
                  {listing.status !== "REMOVED" && (
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "icon" })}
                    >
                      <EditIcon className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
