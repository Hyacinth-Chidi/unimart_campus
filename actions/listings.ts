"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { uploadAsset, deleteAsset } from "@/lib/cloudinary"
import { listingSchema, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/validations/listing"

// Helpers to extract publicId from Cloudinary URL
function getPublicIdFromUrl(url: string) {
  const splits = url.split("/")
  const last = splits[splits.length - 1]
  const filename = last.split(".")[0]
  return `unimart/${filename}`
}

export async function createListing(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (dbUser?.isBanned) {
      return { error: "Your account is banned" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const categoryId = formData.get("categoryId") as string
    const condition = formData.get("condition") as string
    const location = formData.get("location") as string

    // Validate textual data
    const validatedData = listingSchema.safeParse({
      title,
      description,
      price,
      categoryId,
      condition,
      location,
    })

    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message }
    }

    // Process images
    const imageFiles = formData.getAll("images") as File[]
    if (!imageFiles || imageFiles.length === 0 || (imageFiles.length === 1 && imageFiles[0].size === 0)) {
       return { error: "At least one image is required." }
    }
    
    const validImageFiles = imageFiles.filter(f => f.size > 0)
    
    if (validImageFiles.length < 1 || validImageFiles.length > 4) {
      return { error: "Please upload between 1 and 4 images." }
    }

    for (const file of validImageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return { error: `Image ${file.name} exceeds the 5MB limit.` }
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return { error: `Image ${file.name} is an unsupported format. Only JPG, PNG, and WebP are allowed.` }
      }
    }

    // Upload to Cloudinary
    const imageUrls: string[] = []
    for (const file of validImageFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Data = buffer.toString("base64")
      const fileUri = `data:${file.type};base64,${base64Data}`
      
      const uploadResult = await uploadAsset(fileUri, { folder: "unimart" })
      imageUrls.push(uploadResult.secure_url)
    }

    // Save to DB
    const listing = await prisma.listing.create({
      data: {
        ...validatedData.data,
        images: imageUrls,
        ownerId: session.user.id,
      },
    })

    revalidatePath("/dashboard/listings")
    revalidatePath("/")
    
    return { success: true, listingId: listing.id }

  } catch (error: any) {
    console.error("Create listing error:", error)
    return { error: error.message || "Failed to create listing" }
  }
}

export async function getMyListings() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized", listings: [] }
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId: session.user.id },
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return { listings }
  } catch (error: any) {
    console.error("Get my listings error:", error)
    return { error: "Failed to fetch listings", listings: [] }
  }
}

export async function deleteListing(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const listing = await prisma.listing.findUnique({
      where: { id }
    })

    if (!listing) return { error: "Listing not found" }
    
    if (listing.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "Unauthorized: You do not own this listing" }
    }

    // Delete images from Cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const url of listing.images) {
        try {
          const publicId = getPublicIdFromUrl(url)
          await deleteAsset(publicId)
        } catch (e) {
          console.error("Failed to delete image from cloudinary", url, e)
        }
      }
    }

    await prisma.listing.delete({
      where: { id }
    })

    revalidatePath("/dashboard/listings")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    console.error("Delete listing error:", error)
    return { error: "Failed to delete listing" }
  }
}

export async function markAsSold(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return { error: "Listing not found" }
    
    if (listing.ownerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.listing.update({
      where: { id },
      data: { status: "SOLD" }
    })

    revalidatePath("/dashboard/listings")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update listing status" }
  }
}

export async function reactivateListing(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return { error: "Listing not found" }
    
    if (listing.ownerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.listing.update({
      where: { id },
      data: { status: "ACTIVE" }
    })

    revalidatePath("/dashboard/listings")
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    return { error: "Failed to update listing status" }
  }
}

export async function updateListing(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (dbUser?.isBanned) {
      return { error: "Your account is banned" }
    }

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return { error: "Listing not found" }
    
    if (listing.ownerId !== session.user.id) {
      return { error: "Unauthorized: You do not own this listing" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const categoryId = formData.get("categoryId") as string
    const condition = formData.get("condition") as string
    const location = formData.get("location") as string

    // Get the existing images that the user chose to keep
    const existingImagesKept = formData.getAll("existingImages") as string[]

    const validatedData = listingSchema.safeParse({
      title,
      description,
      price,
      categoryId,
      condition,
      location,
    })

    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message }
    }

    // Process new images
    const newImageFiles = formData.getAll("images") as File[]
    const validNewImageFiles = newImageFiles.filter(f => f.size > 0)
    
    const totalImageCount = existingImagesKept.length + validNewImageFiles.length
    
    if (totalImageCount < 1 || totalImageCount > 4) {
      return { error: "Please upload between 1 and 4 images in total." }
    }

    for (const file of validNewImageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return { error: `Image ${file.name} exceeds the 5MB limit.` }
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return { error: `Image ${file.name} is an unsupported format. Only JPG, PNG, and WebP are allowed.` }
      }
    }

    // Determine images to delete from Cloudinary
    const imagesToDelete = listing.images.filter(img => !existingImagesKept.includes(img))
    for (const url of imagesToDelete) {
      try {
        const publicId = getPublicIdFromUrl(url)
        await deleteAsset(publicId)
      } catch (e) {
        console.error("Failed to delete image from cloudinary during update", url, e)
      }
    }

    // Upload new images to Cloudinary
    const newImageUrls: string[] = []
    for (const file of validNewImageFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Data = buffer.toString("base64")
      const fileUri = `data:${file.type};base64,${base64Data}`
      
      const uploadResult = await uploadAsset(fileUri, { folder: "unimart" })
      newImageUrls.push(uploadResult.secure_url)
    }

    // Combine kept images and new images
    const finalImages = [...existingImagesKept, ...newImageUrls]

    // Save to DB
    await prisma.listing.update({
      where: { id },
      data: {
        ...validatedData.data,
        images: finalImages,
      },
    })

    revalidatePath("/dashboard/listings")
    revalidatePath(`/dashboard/listings/${id}/edit`)
    revalidatePath(`/listings/${id}`)
    revalidatePath("/")
    
    return { success: true }
  } catch (error: any) {
    console.error("Update listing error:", error)
    return { error: error.message || "Failed to update listing" }
  }
}

