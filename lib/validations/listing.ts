import { z } from "zod"

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.enum(["NEW", "USED_LIKE_NEW", "USED_FAIR"]),
  location: z.string().optional(),
})
