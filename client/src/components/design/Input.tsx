import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  isLoading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      helperText,
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
              error && "border-destructive focus-visible:ring-destructive",
              icon && iconPosition === "left" && "pl-9",
              icon && iconPosition === "right" && "pr-9",
              isLoading && "opacity-75",
              className
            )}
            disabled={disabled || isLoading}
            ref={ref}
            {...props}
          />
          {icon && (
            <div
              className={cn(
                "absolute flex items-center justify-center h-5 w-5 text-muted-foreground pointer-events-none",
                iconPosition === "left" ? "left-3" : "right-3"
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
