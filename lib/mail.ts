import nodemailer from "nodemailer"

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const verificationLink = `${appUrl}/verify-email?token=${token}`
  const transporter = createTransporter()

  try {
    await transporter.sendMail({
      from: `"Campus Marketplace" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email address - Campus Marketplace",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #f37d20; margin-bottom: 16px;">Welcome to Campus Marketplace!</h2>
          <p style="color: #333;">Hi there,</p>
          <p style="color: #333;">Please click the button below to verify your email address and activate your account:</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${verificationLink}" style="background-color: #f37d20; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p><a href="${verificationLink}" style="color: #1155cc; font-size: 14px; word-break: break-all;">${verificationLink}</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    })
    console.log("✅ Verification email sent to:", email)
  } catch (error) {
    console.error("❌ Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetLink = `${appUrl}/reset-password?token=${token}`
  const transporter = createTransporter()

  try {
    await transporter.sendMail({
      from: `"Campus Marketplace" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password - Campus Marketplace",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #f37d20; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #333;">Hi there,</p>
          <p style="color: #333;">We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #f37d20; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p><a href="${resetLink}" style="color: #1155cc; font-size: 14px; word-break: break-all;">${resetLink}</a></p>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">This link expires in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    })
    console.log("✅ Password reset email sent to:", email)
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}
