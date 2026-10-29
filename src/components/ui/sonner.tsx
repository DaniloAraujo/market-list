import { Toaster as Sonner } from "sonner"

import { useTheme } from "@/hooks/useTheme"

export function Toaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Sonner
      theme={resolvedTheme}
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-border !bg-card !text-card-foreground !font-sans !shadow-md",
          actionButton: "!rounded-lg !bg-primary !text-primary-foreground !font-semibold",
        },
      }}
    />
  )
}
