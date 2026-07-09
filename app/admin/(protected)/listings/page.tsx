import prisma from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { ExternalLinkIcon, PackageOpenIcon } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AdminListingActions } from "./listing-actions"

export const dynamic = "force-dynamic"

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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
    case "SOLD":
      return <Badge variant="secondary">Sold</Badge>
    case "REMOVED":
      return <Badge variant="destructive">Removed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { name: true, email: true }
      },
      category: {
        select: { name: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings Moderation"
        description="Review all marketplace listings and remove inappropriate content."
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Item</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="relative size-12 rounded-md overflow-hidden bg-muted border">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className={`object-cover ${listing.status === "REMOVED" ? "grayscale opacity-50" : ""}`}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageOpenIcon className="size-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1 max-w-[250px]">{listing.title}</span>
                      <span className="text-sm font-semibold text-primary mt-1">
                        {formatPrice(listing.price)}
                      </span>
                      <Link 
                        href={`/listings/${listing.id}`} 
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1 w-fit"
                        target="_blank"
                      >
                        View public <ExternalLinkIcon className="size-3" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{listing.owner.name}</span>
                      <span className="text-xs text-muted-foreground">{listing.owner.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{listing.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(listing.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminListingActions
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        status: listing.status,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {listings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No listings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
