import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../shared/cn.js";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "destructive"
    | "link";
  size?: "xs" | "sm" | "default" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    // Map alternate names
    const v = variant === "primary" ? "default" : variant === "danger" ? "destructive" : variant;
    const s = size === "md" ? "default" : size;

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "focus-visible:ring-primary ring-offset-background inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": v === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": v === "secondary",
            "border-input bg-background hover:bg-accent hover:text-accent-foreground border":
              v === "outline",
            "hover:bg-accent hover:text-accent-foreground": v === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              v === "destructive",
            "text-primary underline-offset-4 hover:underline": v === "link",
            "h-7 rounded-md px-2 text-xs": s === "xs",
            "h-9 rounded-md px-3": s === "sm",
            "h-10 px-4 py-2": s === "default",
            "h-11 rounded-md px-8": s === "lg",
            "h-10 w-10": s === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
