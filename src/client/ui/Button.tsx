import React from "react";
import { cn } from "../../shared/cn";

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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Map alternate names
    const v =
      variant === "primary"
        ? "default"
        : variant === "danger"
          ? "destructive"
          : variant;
    const s = size === "md" ? "default" : size;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90":
              v === "default",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              v === "secondary",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground":
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
