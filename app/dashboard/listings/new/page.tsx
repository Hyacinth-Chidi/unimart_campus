import { redirect } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { ListingForm } from "../listing-form"
import { PageHeader } from "@/components/common/page-header"

export default async function NewListingPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (dbUser?.isBanned) redirect("/dashboard")

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  })

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Create Listing"
        description="Fill out the details below to post your item on the marketplace."
      />
      <div className="mt-8 p-6 bg-card rounded-xl border shadow-sm">
        <ListingForm categories={categories} />
      </div>
    </div>
  )
}
