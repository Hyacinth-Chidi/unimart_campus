import * as React from "react"

import { cn } from "@/lib/utils"

function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="container"
      className={cn("page-container w-full", className)}
      {...props}
    />
  )
}

export { Container }
