"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, CheckCircle2Icon, Trash2Icon, RefreshCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

import { markAsSold, reactivateListing, deleteListing } from "@/actions/listings"

export function ListingActions({ 
  listingId, 
  status 
}: { 
  listingId: string, 
  status: "ACTIVE" | "SOLD" | "REMOVED" 
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleMarkSold = async () => {
    setIsPending(true)
    await markAsSold(listingId)
    setIsPending(false)
  }

  const handleReactivate = async () => {
    setIsPending(true)
    await reactivateListing(listingId)
    setIsPending(false)
  }

  const handleDelete = async () => {
    setIsPending(true)
    await deleteListing(listingId)
    setIsPending(false)
  }

  return (
    <div className="flex items-center gap-2">
      {status === "ACTIVE" && (
        <Button variant="outline" size="sm" onClick={handleMarkSold} disabled={isPending}>
          {isPending ? <Loader2Icon className="size-4 animate-spin mr-2" /> : <CheckCircle2Icon className="size-4 mr-2 text-green-600" />}
          Mark as Sold
        </Button>
      )}

      {status === "SOLD" && (
        <Button variant="outline" size="sm" onClick={handleReactivate} disabled={isPending}>
          {isPending ? <Loader2Icon className="size-4 animate-spin mr-2" /> : <RefreshCcwIcon className="size-4 mr-2" />}
          Reactivate
        </Button>
      )}

      <Dialog>
        <DialogTrigger render={
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={isPending}>
            <Trash2Icon className="size-4" />
          </Button>
        } />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this listing? This action cannot be undone and will remove all associated images.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2Icon className="size-4 animate-spin mr-2" /> : <Trash2Icon className="size-4 mr-2" />}
              Delete Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
