import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../shared/cn.js";
import type { Toast, ToastType } from "../stores/createToastStore.js";

export interface ToastContainerProps {
  /** Current list of toasts (from your store) */
  toasts: Toast[];
  /** Remove callback (from your store) */
  removeToast: (id: string) => void;
  /** Override outer container classes */
  className?: string;
  /** Override individual toast card classes */
  toastClassName?: string;
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const borderMap: Record<ToastType, string> = {
  success: "border-green-300 dark:border-green-700",
  error: "border-red-300 dark:border-red-700",
  warning: "border-amber-300 dark:border-amber-700",
  info: "border-blue-300 dark:border-blue-700",
};

const iconColorMap: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function ToastContainer({
  toasts,
  removeToast,
  className,
  toastClassName,
}: ToastContainerProps) {
  // Always keep the aria-live container mounted so screen readers announce newly added toasts (WCAG 4.1.3)
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:justify-end",
        className,
      )}
    >
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const isError = toast.type === "error";
        return (
          <div
            key={toast.id}
            className={cn(
              "bg-card text-card-foreground pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-lg border p-4 shadow-lg",
              borderMap[toast.type],
              toastClassName,
            )}
            role={isError ? "alert" : "status"}
            aria-live={isError ? "assertive" : "polite"}
          >
            <Icon className={cn("h-5 w-5 shrink-0", iconColorMap[toast.type])} aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring shrink-0 rounded-md focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => {
                removeToast(toast.id);
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
