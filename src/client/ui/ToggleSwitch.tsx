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
 * Synchronized from zlog project for global use.
 * - sm: h-5 w-9 track, h-4 w-4 thumb
 * - md: h-6 w-11 track, h-5 w-5 thumb (default)
 */
export function ToggleSwitch({
  checked,
  onToggle,
  label,
  size = "md",
  className,
  ...props
}: ToggleSwitchProps) {
  const isMd = size === "md";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "focus:ring-primary relative rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
        isMd ? "h-6 w-11" : "h-5 w-9",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "absolute top-0.5 rounded-full bg-white shadow-sm transition-transform",
          isMd
            ? `h-5 w-5 ${checked ? "translate-x-[20px]" : "translate-x-0.5"}`
            : `h-4 w-4 ${checked ? "translate-x-[16px]" : "translate-x-0.5"}`,
        )}
      />
    </button>
  );
}
