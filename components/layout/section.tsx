import * as React from "react"

import { Container } from "@/components/layout/container"
import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  containerClassName?: string
  fullBleed?: boolean
}

function Section({
  className,
  containerClassName,
  fullBleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section data-slot="section" className={cn("page-section", className)} {...props}>
      {fullBleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  )
}

export { Section }
