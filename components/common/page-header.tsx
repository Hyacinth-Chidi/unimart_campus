import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = React.ComponentProps<"div"> & {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  align?: "start" | "center"
}

function PageHeader({
  className,
  eyebrow,
  title,
  description,
  action,
  align = "start",
  ...props
}: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      data-align={align}
      className={cn(
        "flex flex-col gap-(--spacing-base) data-[align=center]:items-center data-[align=center]:text-center",
        className
      )}
      {...props}
    >
      {eyebrow ? (
        <div className="text-sm font-medium text-muted-foreground">{eyebrow}</div>
      ) : null}
      <div className="space-y-(--spacing-sm)">
        <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap gap-(--spacing-sm)">{action}</div> : null}
    </div>
  )
}

export { PageHeader }
