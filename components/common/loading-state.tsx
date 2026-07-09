import * as React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type LoadingStateProps = React.ComponentProps<"div"> & {
  title?: string
  description?: string
  count?: number
}

function LoadingState({
  className,
  title = "Loading content",
  description = "This space is reserved for data-driven marketplace sections.",
  count = 3,
  ...props
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-(--spacing-base)", className)} {...props}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="listing-grid">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="border-dashed bg-muted/15">
            <CardHeader className="space-y-(--spacing-base)">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-(--spacing-base)">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export { LoadingState }
