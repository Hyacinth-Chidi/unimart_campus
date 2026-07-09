import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { PackageIcon, EyeIcon, AlertTriangleIcon } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [activeListingsCount, viewCountResult, openReportsCount] = await Promise.all([
    prisma.listing.count({
      where: { ownerId: session.user.id, status: "ACTIVE" }
    }),
    prisma.listing.aggregate({
      where: { ownerId: session.user.id },
      _sum: { viewCount: true }
    }),
    prisma.report.count({
      where: { 
        listing: { ownerId: session.user.id },
        status: "OPEN"
      }
    })
  ])

  const totalViews = viewCountResult._sum.viewCount || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${session.user.name?.split(" ")[0] || "there"}!`}
        description="Here&apos;s an overview of your marketplace activity."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Listings</CardTitle>
            <PackageIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <EyeIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports</CardTitle>
            <AlertTriangleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openReportsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Open reports on your items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
