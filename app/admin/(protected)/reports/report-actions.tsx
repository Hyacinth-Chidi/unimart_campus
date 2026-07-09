"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2Icon, XCircleIcon, Loader2Icon } from "lucide-react"

import { resolveReport, dismissReport } from "@/actions/admin"
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

interface ReportActionsProps {
  report: {
    id: string
    status: string
  }
}

export function ReportActions({ report }: ReportActionsProps) {
  const [isPending, setIsPending] = useState(false)
  
  if (report.status !== "OPEN") {
    return null
  }

  const handleResolve = async () => {
    setIsPending(true)
    const result = await resolveReport(report.id)
    setIsPending(false)

    if (result?.error) {
      toast.error("Error", { description: result.error })
    } else if (result?.success) {
      toast.success("Success", { description: result.success })
    }
  }

  const handleDismiss = async () => {
    setIsPending(true)
    const result = await dismissReport(report.id)
    setIsPending(false)

    if (result?.error) {
      toast.error("Error", { description: result.error })
    } else if (result?.success) {
      toast.success("Success", { description: result.success })
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-muted-foreground" disabled={isPending}>
            <XCircleIcon className="mr-2 size-4" />
            Dismiss
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the report as dismissed, meaning no action is required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDismiss} disabled={isPending}>
              {isPending ? "Processing..." : "Yes, Dismiss"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isPending}>
            <CheckCircle2Icon className="mr-2 size-4" />
            Resolve
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this report as resolved. Make sure you have taken the necessary actions (e.g., removing the listing or banning the user) before resolving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolve} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
              {isPending ? "Processing..." : "Yes, Resolved"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
