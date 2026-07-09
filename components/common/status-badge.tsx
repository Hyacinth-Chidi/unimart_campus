import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig = {
  ACTIVE: { label: "Active", variant: "default" },
  SOLD: { label: "Sold", variant: "secondary" },
  REMOVED: { label: "Removed", variant: "destructive" },
  OPEN: { label: "Open", variant: "outline" },
  RESOLVED: { label: "Resolved", variant: "secondary" },
  DISMISSED: { label: "Dismissed", variant: "ghost" },
  VERIFIED: { label: "Verified", variant: "default" },
  UNVERIFIED: { label: "Unverified", variant: "outline" },
} as const

type KnownStatus = keyof typeof statusConfig

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "children" | "variant"> & {
  status: KnownStatus | string
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  const config = statusConfig[status as KnownStatus]

  return (
    <Badge
      variant={config?.variant ?? "outline"}
      className={cn("capitalize", className)}
      {...props}
    >
      {config?.label ?? formatStatus(status)}
    </Badge>
  )
}

export { StatusBadge }
