import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../shared/cn.js";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Reusable select component with custom styling and vertically centered Chevron icon.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          className={cn(
            // Reserve pr-9 on the right so long option labels never overlap the chevron icon
            "border-input bg-background text-foreground focus-visible:ring-primary flex h-10 w-full appearance-none rounded-md border py-2 pr-9 pl-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Vertically center chevron dynamically so custom select heights remain aligned */}
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 opacity-70"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
