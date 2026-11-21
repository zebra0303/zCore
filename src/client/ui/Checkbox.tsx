import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../shared/cn.js";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Reusable checkbox component with custom styling and accessibility.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      // Use shrink-wrapped inline-flex span so the centered Check icon aligns to the 16x16 input
      <span className="relative inline-flex shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className={cn(
            "peer border-input focus-visible:ring-primary checked:bg-primary checked:border-primary h-4 w-4 shrink-0 appearance-none rounded border bg-transparent shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        <Check
          aria-hidden="true"
          className="text-primary-foreground pointer-events-none absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
        />
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
