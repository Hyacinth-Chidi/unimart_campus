"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { StoreIcon, CheckCircle2Icon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPassword } from "@/actions/auth"

const formSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema as any),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      setError("Invalid reset link.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const result = await resetPassword({ token, password: values.password })

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setIsLoading(false)
  }

  if (!token) {
    return (
      <Container className="flex min-h-[80vh] items-center justify-center py-12">
        <Card className="mx-auto w-full max-w-md shadow-xl border-border/50 text-center">
          <CardHeader className="space-y-4 pt-8">
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Link href="/forgot-password" className={buttonVariants({ variant: "outline", className: "w-full h-11" })}>
              Request a New Link
            </Link>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container className="flex min-h-[80vh] items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-3 text-center">
          <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-xl font-bold text-primary">
            <StoreIcon className="size-6" />
            Unimart
          </Link>
          <CardTitle className="text-2xl font-bold">
            {success ? "Password Updated" : "Set a New Password"}
          </CardTitle>
          <CardDescription>
            {success ? "You can now log in with your new password." : "Enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2Icon className="size-8 text-emerald-500" />
              </div>
              <Link href="/login" className={buttonVariants({ className: "w-full h-11" })}>
                Continue to Login
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input placeholder="******" type="password" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="******" type="password" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Container className="flex min-h-[80vh] items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Container>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

