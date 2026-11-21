import React from "react";
import { cn } from "../../shared/cn.js";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-primary text-primary-foreground border-transparent": variant === "default",
            "bg-secondary text-secondary-foreground border-transparent": variant === "secondary",
            // Explicit border-border prevents currentColor border mismatch in Tailwind v4
            "border-border text-foreground": variant === "outline",
            "bg-destructive text-destructive-foreground border-transparent":
              variant === "destructive",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";
