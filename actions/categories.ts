"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/app/generated/prisma/client"

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
})

async function checkAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.")
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { listings: true }
        }
      }
    })
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    throw new Error("Failed to load categories.")
  }
}

export async function createCategory(formData: FormData) {
  try {
    await checkAdmin()
    
    const rawName = formData.get("name")
    const { name } = categorySchema.parse({ name: rawName })

    const existing = await prisma.category.findUnique({
      where: { name }
    })

    if (existing) {
      return { error: "A category with this name already exists." }
    }

    await prisma.category.create({
      data: { name }
    })

    revalidatePath("/admin/categories")
    return { success: "Category created successfully." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    await checkAdmin()
    
    const rawName = formData.get("name")
    const { name } = categorySchema.parse({ name: rawName })

    const existing = await prisma.category.findUnique({
      where: { name }
    })

    if (existing && existing.id !== id) {
      return { error: "A category with this name already exists." }
    }

    await prisma.category.update({
      where: { id },
      data: { name }
    })

    revalidatePath("/admin/categories")
    return { success: "Category updated successfully." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}

export async function deleteCategory(id: string) {
  try {
    await checkAdmin()

    await prisma.category.delete({
      where: { id }
    })

    revalidatePath("/admin/categories")
    return { success: "Category deleted successfully." }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003 is the foreign key constraint failed error
      if (error.code === "P2003") {
        return { error: "Cannot delete category because it has active listings attached to it." }
      }
    }
    return { error: error instanceof Error ? error.message : "Something went wrong." }
  }
}
