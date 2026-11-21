import React from "react";
import { cn } from "../../shared/cn.js";

export interface ToggleSwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  size?: "sm" | "md";
}

/**
 * Reusable toggle switch component with built-in accessibility.
 * - sm: h-5 w-9 track, h-4 w-4 thumb
 * - md: h-6 w-11 track, h-5 w-5 thumb (default)
 */
export const ToggleSwitch = React.forwardRef<HTMLButtonElement, ToggleSwitchProps>(
  ({ checked, onToggle, label, size = "md", className, ...props }, ref) => {
    const isMd = size === "md";

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "focus-visible:ring-primary relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
          isMd ? "h-6 w-11" : "h-5 w-9",
          className,
        )}
        {...props}
      >
        {/* Anchor thumb to left-0 so translate-x shifts cleanly regardless of button text-align */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0.5 left-0 block rounded-full bg-white shadow-sm transition-transform",
            isMd
              ? cn("h-5 w-5", checked ? "translate-x-5" : "translate-x-0.5")
              : cn("h-4 w-4", checked ? "translate-x-4" : "translate-x-0.5"),
          )}
        />
      </button>
    );
  },
);
ToggleSwitch.displayName = "ToggleSwitch";
