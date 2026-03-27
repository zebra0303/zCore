import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../shared/cn.js";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Reusable checkbox component with custom styling and accessibility.
 * Synchronized from BigStone project for global use.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={cn(
            "peer focus-visible:ring-primary checked:bg-primary checked:border-primary h-4 w-4 shrink-0 appearance-none rounded-sm border border-gray-900 bg-transparent shadow focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500",
            className,
          )}
          ref={ref}
          {...props}
        />
        <Check className="text-primary-foreground pointer-events-none absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100" />
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
