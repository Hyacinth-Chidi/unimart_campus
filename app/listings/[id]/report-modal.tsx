"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangleIcon, FlagIcon } from "lucide-react"

import { reportListing } from "@/actions/public"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReportModalProps {
  listingId: string
  isLoggedIn: boolean
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Inappropriate content",
  "Scam or fraud",
  "Item is no longer available",
  "Other",
]

export function ReportModal({ listingId, isLoggedIn }: ReportModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast.error("Please select a reason.")
      return
    }

    const formData = new FormData()
    formData.append("listingId", listingId)
    formData.append("reason", reason)
    if (details) formData.append("details", details)

    setIsSubmitting(true)
    const result = await reportListing(formData)
    setIsSubmitting(false)

    if (result.error) {
      toast.error("Error", { description: result.error })
    } else if (result.success) {
      toast.success("Success", { description: result.success })
      setOpen(false)
      setReason("")
      setDetails("")
    }
  }

  if (!isLoggedIn) {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground w-full justify-start" onClick={() => toast.error("You must be logged in to report a listing.")}>
        <FlagIcon className="size-4 mr-2" />
        Report this listing
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="sm" className="text-muted-foreground w-full justify-start hover:text-destructive hover:bg-destructive/10">
          <FlagIcon className="size-4 mr-2" />
          Report this listing
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="size-5 text-destructive" />
              Report Listing
            </DialogTitle>
            <DialogDescription>
              Help keep our campus marketplace safe. Let us know why you are reporting this item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for reporting</Label>
              <Select value={reason} onValueChange={(val) => setReason(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Provide more context for our admins..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
