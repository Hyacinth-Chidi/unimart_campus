"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail"
import { z } from "zod"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

// ─── Register ────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  department: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function register(formData: z.infer<typeof registerSchema>) {
  try {
    const validatedData = registerSchema.parse(formData)
    const { name, email, phone, department, password } = validatedData

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber: phone,
        department,
        passwordHash,
      },
    })

    const token = uuidv4()
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    })

    await sendVerificationEmail(email, token)

    return { success: "Account created! Please check your email to verify." }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided" }
    }
    console.error(error)
    return { error: "Something went wrong during registration" }
  }
}

// ─── Login ───────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function login(formData: z.infer<typeof loginSchema>) {
  try {
    const validatedData = loginSchema.parse(formData)

    // Check if the user exists and is verified before attempting sign in
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      return { error: "Invalid email or password" }
    }

    if (!user.isVerified) {
      return { error: "Please verify your email before logging in. Check your inbox." }
    }

    const passwordsMatch = await bcrypt.compare(validatedData.password, user.passwordHash)
    if (!passwordsMatch) {
      return { error: "Invalid email or password" }
    }

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    })

    return { success: "Logged in successfully" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}

// ─── Logout ──────────────────────────────────────────────────────────

export async function logout() {
  await signOut({ redirect: false })
}

// ─── Forgot Password ────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function requestPasswordReset(
  formData: z.infer<typeof forgotPasswordSchema>
) {
  try {
    const { email } = forgotPasswordSchema.parse(formData)

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: "If an account exists, a reset link has been sent." }
    }

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({ where: { email } })

    const token = uuidv4()
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    })

    await sendPasswordResetEmail(email, token)

    return { success: "If an account exists, a reset link has been sent." }
  } catch {
    return { error: "Something went wrong. Please try again." }
  }
}

// ─── Reset Password ─────────────────────────────────────────────────

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function resetPassword(
  formData: z.infer<typeof resetPasswordSchema>
) {
  try {
    const { token, password } = resetPasswordSchema.parse(formData)

    const existingToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!existingToken) {
      return { error: "Invalid or expired reset link." }
    }

    if (new Date(existingToken.expires) < new Date()) {
      await prisma.verificationToken.delete({ where: { id: existingToken.id } })
      return { error: "Reset link has expired. Please request a new one." }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: existingToken.email },
      data: { passwordHash },
    })

    await prisma.verificationToken.delete({ where: { id: existingToken.id } })

    return { success: "Password updated! You can now log in." }
  } catch {
    return { error: "Something went wrong. Please try again." }
  }
}
