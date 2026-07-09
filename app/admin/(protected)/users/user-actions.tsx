"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ShieldAlertIcon, ShieldCheckIcon } from "lucide-react"

import { toggleBanUser } from "@/actions/admin"
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

interface UserActionsProps {
  user: {
    id: string
    name: string
    isBanned: boolean
    role: string
  }
}

export function UserActions({ user }: UserActionsProps) {
  const [isPending, setIsPending] = useState(false)

  // Disable actions for ADMINs
  if (user.role === "ADMIN") {
    return (
      <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
        Admin
      </Button>
    )
  }

  const handleToggleBan = async () => {
    setIsPending(true)
    const result = await toggleBanUser(user.id)
    setIsPending(false)

    if (result?.error) {
      toast.error("Error", { description: result.error })
    } else if (result?.success) {
      toast.success("Success", { description: result.success })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={user.isBanned ? "outline" : "destructive"}
          size="sm"
          className="w-full sm:w-auto"
        >
          {user.isBanned ? (
            <>
              <ShieldCheckIcon className="mr-2 size-4 text-green-500" />
              Unban
            </>
          ) : (
            <>
              <ShieldAlertIcon className="mr-2 size-4" />
              Ban
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user.isBanned ? "Unban User?" : "Ban User?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.isBanned
              ? `Are you sure you want to unban ${user.name}? They will regain access to their account and the marketplace.`
              : `Are you sure you want to ban ${user.name}? They will be immediately logged out and unable to access the marketplace.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleToggleBan()
            }}
            disabled={isPending}
            className={user.isBanned ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
          >
            {isPending ? "Processing..." : user.isBanned ? "Yes, Unban" : "Yes, Ban"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
