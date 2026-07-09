import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { Container } from "@/components/layout/container"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    redirect("/")
  }

  let error = null
  let success = false

  try {
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!existingToken) {
      error = "Token does not exist!"
    } else if (new Date(existingToken.expires) < new Date()) {
      error = "Token has expired!"
    } else {
      const user = await prisma.user.findUnique({
        where: { email: existingToken.email },
      })

      if (!user) {
        error = "Email does not exist!"
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isVerified: true,
          },
        })

        await prisma.verificationToken.delete({
          where: { id: existingToken.id },
        })

        success = true
      }
    }
  } catch {
    error = "Something went wrong!"
  }

  return (
    <Container className="flex min-h-[80vh] items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md shadow-xl border-border/50 text-center">
        <CardHeader className="space-y-4 pt-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
            {success ? (
              <CheckCircle2Icon className="size-8 text-emerald-500" />
            ) : (
              <XCircleIcon className="size-8 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {success ? "Email Verified" : "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {success
              ? "Your email address has been successfully verified. You can now access all features of Campus Marketplace."
              : error}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 pt-4">
          {success ? (
            <Link href="/login" className={buttonVariants({ className: "w-full h-11" })}>
              Continue to Login
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "outline", className: "w-full h-11" })}>
              Back to Login
            </Link>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
