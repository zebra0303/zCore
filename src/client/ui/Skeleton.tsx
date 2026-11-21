import React from "react";
import { cn } from "../../shared/cn.js";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("bg-muted animate-pulse rounded-lg", className)}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
