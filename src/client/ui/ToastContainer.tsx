import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../shared/cn.js";
import type { Toast } from "../stores/createToastStore.js";

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

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
} as const;

const borderMap = {
  success: "border-green-300 dark:border-green-700",
  error: "border-red-300 dark:border-red-700",
  info: "border-blue-300 dark:border-blue-700",
} as const;

const iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
} as const;

export function ToastContainer({
  toasts,
  removeToast,
  className,
  toastClassName,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className={cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 px-4 py-6 sm:items-end sm:justify-end",
        className,
      )}
    >
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-lg border bg-white p-4 shadow-lg dark:bg-gray-800",
              borderMap[toast.type],
              toastClassName,
            )}
            role="alert"
          >
            <Icon
              className={cn("h-5 w-5 shrink-0", iconColorMap[toast.type])}
            />
            <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {toast.message}
            </p>
            <button
              type="button"
              className="shrink-0 rounded-md text-gray-400 hover:text-gray-600 focus:ring-2 focus:outline-none dark:hover:text-gray-200"
              onClick={() => removeToast(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
