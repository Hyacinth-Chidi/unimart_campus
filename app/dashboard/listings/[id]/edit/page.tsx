import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { ListingForm } from "../../listing-form"
import { PageHeader } from "@/components/common/page-header"

export default async function EditListingPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  
  const resolvedParams = await params
  const id = resolvedParams.id

  const [categories, listing] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.listing.findUnique({
      where: { id }
    })
  ])

  if (!listing) notFound()
  
  if (listing.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard/listings")
  }

  // Convert Decimal to number for the form
  const initialData = {
    ...listing,
    price: Number(listing.price),
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Edit Listing"
        description="Update the details of your listing."
      />
      <div className="mt-8 p-6 bg-card rounded-xl border shadow-sm">
        <ListingForm categories={categories} initialData={initialData} />
      </div>
    </div>
  )
}
