import * as React from "react"

import { cn } from "@/lib/utils"

const inputStyles =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:text-sm"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn(inputStyles, className)} ref={ref} {...props} />
  )
)
Input.displayName = "Input"

export { Input, inputStyles }
