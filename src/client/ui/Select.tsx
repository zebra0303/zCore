import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../shared/cn.js";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Reusable select component with custom styling and Chevron icon.
 * Synchronized from BigStone project for global use.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "focus:ring-primary dark:focus:ring-primary flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-gray-500 opacity-50 dark:text-gray-400" />
      </div>
    );
  },
);
Select.displayName = "Select";
