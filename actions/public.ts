"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"

const reportSchema = z.object({
  listingId: z.string(),
  reason: z.string().min(3, "Reason is required"),
  details: z.string().optional(),
})

export async function reportListing(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "You must be logged in to report a listing." }
    }

    const { listingId, reason, details } = reportSchema.parse({
      listingId: formData.get("listingId"),
      reason: formData.get("reason"),
      details: formData.get("details") || undefined,
    })

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return { error: "Listing not found." }
    }
    
    if (listing.ownerId === session.user.id) {
      return { error: "You cannot report your own listing." }
    }

    // Check if user already reported this recently (optional spam prevention)
    const existingReport = await prisma.report.findFirst({
      where: {
        listingId,
        userId: session.user.id,
        status: "OPEN"
      }
    })

    if (existingReport) {
      return { error: "You already have an open report for this listing." }
    }

    await prisma.report.create({
      data: {
        reason,
        details,
        listingId,
        userId: session.user.id,
      },
    })

    return { success: "Report submitted successfully. Our team will review it." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: "Failed to submit report." }
  }
}
