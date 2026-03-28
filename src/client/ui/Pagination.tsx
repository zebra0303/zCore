import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../shared/cn.js";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Override nav container classes */
  className?: string;
  /** Override individual page button classes */
  buttonClassName?: string;
  /** Override active page button classes */
  activeButtonClassName?: string;
}

/**
 * Build the visible page list with ellipsis markers.
 * Pure logic — exported for testing.
 */
export function buildPageList(
  currentPage: number,
  totalPages: number,
  delta = 2,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

const baseBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors disabled:pointer-events-none disabled:opacity-50";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  buttonClassName,
  activeButtonClassName,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label={`Page ${currentPage} of ${totalPages}`}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        className={cn(baseBtn, buttonClassName)}
        disabled={currentPage === 1}
        onClick={() => {
          onPageChange(currentPage - 1);
        }}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            className={cn(
              baseBtn,
              page === currentPage
                ? cn("bg-primary text-primary-foreground", activeButtonClassName)
                : buttonClassName,
            )}
            onClick={() => {
              onPageChange(page);
            }}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        className={cn(baseBtn, buttonClassName)}
        disabled={currentPage === totalPages}
        onClick={() => {
          onPageChange(currentPage + 1);
        }}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
