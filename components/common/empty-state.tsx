import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed bg-muted/20", className)} {...props}>
      <CardHeader className="items-center text-center">
        {icon ? (
          <div className="flex size-12 items-center justify-center rounded-full bg-background ring-1 ring-border">
            {icon}
          </div>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-xl">{description}</CardDescription>
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-center">
          {action}
        </CardContent>
      ) : null}
    </Card>
  )
}

export { EmptyState }
