"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/auth"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number is required"),
  department: z.string().optional(),
})

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }

    const validatedData = profileSchema.parse(formData)

    // Ensure phone number has country code for WhatsApp (default to Nigeria +234 if it starts with 0)
    let formattedPhone = validatedData.phone.replace(/[^0-9+]/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+234" + formattedPhone.slice(1)
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        phoneNumber: formattedPhone,
        department: validatedData.department,
      },
    })

    return { success: "Profile updated successfully!" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided" }
    }
    console.error("Profile update error:", error)
    return { error: "Something went wrong" }
  }
}
