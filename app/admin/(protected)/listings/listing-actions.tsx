"use client"

import { useState } from "react"
import { toast } from "sonner"
import { BanIcon, Trash2Icon } from "lucide-react"

import { adminRemoveListing, adminDeleteListing } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface AdminListingActionsProps {
  listing: {
    id: string
    title: string
    status: string
  }
}

export function AdminListingActions({ listing }: AdminListingActionsProps) {
  const [isPending, setIsPending] = useState(false)
  const isRemoved = listing.status === "REMOVED"

  const handleRemove = async () => {
    setIsPending(true)
    const result = await adminRemoveListing(listing.id)
    setIsPending(false)

    if (result?.error) {
      toast.error("Error", { description: result.error })
    } else if (result?.success) {
      toast.success("Success", { description: result.success })
    }
  }

  const handleDelete = async () => {
    setIsPending(true)
    const result = await adminDeleteListing(listing.id)
    setIsPending(false)

    if (result?.error) {
      toast.error("Error", { description: result.error })
    } else if (result?.success) {
      toast.success("Success", { description: result.success })
    }
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent align="end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={isRemoved}
                className={!isRemoved ? "text-orange-600 focus:text-orange-600" : ""}
              >
                <BanIcon className="mr-2 size-4" />
                Soft Remove
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will hide the listing &quot;{listing.title}&quot; from the public marketplace. 
                  The record will be kept for auditing purposes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove} className="bg-orange-600 hover:bg-orange-700">
                  Yes, Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="mr-2 size-4" />
                Hard Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will completely delete &quot;{listing.title}&quot;, including all uploaded images from Cloudinary.
                  This action CANNOT be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Yes, Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
