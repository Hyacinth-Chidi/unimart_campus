import prisma from "@/lib/prisma"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ReportActions } from "./report-actions"

export const dynamic = "force-dynamic"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "OPEN":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Open</Badge>
    case "RESOLVED":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Resolved</Badge>
    case "DISMISSED":
      return <Badge variant="outline" className="text-muted-foreground">Dismissed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [
      { status: "asc" }, // OPEN comes first typically (O before R before D) - wait, alphabetical O, R, D. D is first. Let's rely on createdAt and status custom sort, or just createdAt.
      { createdAt: "desc" }
    ],
    include: {
      reportedBy: {
        select: { name: true, email: true }
      },
      listing: {
        select: { id: true, title: true, status: true, owner: { select: { name: true } } }
      }
    }
  })

  // Sort so OPEN is always first
  const sortedReports = [...reports].sort((a, b) => {
    if (a.status === "OPEN" && b.status !== "OPEN") return -1;
    if (a.status !== "OPEN" && b.status === "OPEN") return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Management"
        description="Review and resolve content flagged by users."
      />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReports.map((report) => (
                <TableRow key={report.id} className={report.status === "OPEN" ? "bg-destructive/5" : ""}>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{report.reason}</span>
                      {report.details && (
                        <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-[250px]">
                          {report.details}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1 max-w-[200px]">{report.listing.title}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">Owner: {report.listing.owner.name}</span>
                      <Link 
                        href={`/listings/${report.listing.id}`} 
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 w-fit"
                        target="_blank"
                      >
                        View listing <ExternalLinkIcon className="size-3" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{report.reportedBy.name}</span>
                      <span className="text-xs text-muted-foreground">{report.reportedBy.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <ReportActions
                      report={{
                        id: report.id,
                        status: report.status,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
