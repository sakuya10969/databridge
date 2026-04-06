import * as React from "react"

import { cn } from "~/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-[#111b33] px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#4a5568] focus-visible:border-primary focus-visible:ring-[0_0_0_1px_rgba(38,101,253,0.7),0_0_20px_rgba(38,101,253,0.15)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[rgba(17,27,51,0.7)] disabled:text-[#4a5568] disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-[0_0_0_1px_rgba(255,180,171,0.65)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
