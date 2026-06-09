import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Text input — Phase 1.03 handover §B.5: 52px tall, 2px border, soft `--field`
 * fill, focus goes white with a blue ring. `aria-invalid` flips it to the error
 * border + ring so a failed validation reads without relying on colour alone
 * (the gate also renders a text hint + moves focus).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-13 w-full min-w-0 rounded-xl border-2 border-input bg-muted px-4 py-2 text-base text-ink shadow-xs transition-[color,background-color,box-shadow] outline-none",
        "placeholder:text-ink-faint selection:bg-secondary selection:text-secondary-foreground",
        "focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/40",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
