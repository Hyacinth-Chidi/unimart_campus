import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { UsersIcon, PackageIcon, AlertTriangleIcon, TagsIcon } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const [userCount, listingCount, reportCount, categoryCount] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.listing.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.category.count(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="High-level statistics and marketplace health."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            <PackageIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            <TagsIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active categories</p>
          </CardContent>
        </Card>

        <Card className={reportCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${reportCount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
              Open Reports
            </CardTitle>
            <AlertTriangleIcon className={`size-4 ${reportCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportCount > 0 ? "text-destructive" : ""}`}>
              {reportCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires moderation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
