"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { uploadAsset, deleteAsset } from "@/lib/cloudinary"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.")
  }
}

// ── Users ──────────────────────────────────────────────────

export async function toggleBanUser(userId: string) {
  try {
    await checkAdmin()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { error: "User not found." }
    if (user.role === "ADMIN") return { error: "Cannot ban another admin." }

    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    })

    revalidatePath("/admin/users")
    return {
      success: user.isBanned
        ? "User has been unbanned."
        : "User has been banned.",
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

// ── Listings ───────────────────────────────────────────────

function getPublicIdFromUrl(url: string) {
  const splits = url.split("/")
  const last = splits[splits.length - 1]
  const filename = last.split(".")[0]
  return `unimart/${filename}`
}

export async function adminRemoveListing(listingId: string) {
  try {
    await checkAdmin()

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return { error: "Listing not found." }
    if (listing.status === "REMOVED") return { error: "Listing is already removed." }

    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "REMOVED" },
    })

    revalidatePath("/admin/listings")
    revalidatePath("/")
    return { success: "Listing has been removed from the marketplace." }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

export async function adminDeleteListing(listingId: string) {
  try {
    await checkAdmin()

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return { error: "Listing not found." }

    // Clean up Cloudinary images
    if (listing.images && listing.images.length > 0) {
      for (const url of listing.images) {
        try {
          const publicId = getPublicIdFromUrl(url)
          await deleteAsset(publicId)
        } catch (e) {
          console.error("Failed to delete image from Cloudinary:", url, e)
        }
      }
    }

    // Delete any reports associated with this listing first
    await prisma.report.deleteMany({ where: { listingId } })

    await prisma.listing.delete({ where: { id: listingId } })

    revalidatePath("/admin/listings")
    revalidatePath("/admin/reports")
    revalidatePath("/")
    return { success: "Listing and its images have been permanently deleted." }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

// ── Reports ────────────────────────────────────────────────

export async function resolveReport(reportId: string) {
  try {
    await checkAdmin()

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { error: "Report not found." }
    if (report.status !== "OPEN") return { error: "Report is already processed." }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: "RESOLVED" },
    })

    revalidatePath("/admin/reports")
    return { success: "Report marked as resolved." }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

export async function dismissReport(reportId: string) {
  try {
    await checkAdmin()

    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { error: "Report not found." }
    if (report.status !== "OPEN") return { error: "Report is already processed." }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: "DISMISSED" },
    })

    revalidatePath("/admin/reports")
    return { success: "Report dismissed." }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}
