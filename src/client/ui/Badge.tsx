import React from "react";
import { cn } from "../../shared/cn.js";

// refactor: use span for semantic inline element
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent":
            variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent":
            variant === "secondary",
          "text-foreground": variant === "outline",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent":
            variant === "destructive",
        },
        className,
      )}
      {...props}
    />
  );
}
