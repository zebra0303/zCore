import { AlertCircle } from "lucide-react";
import { cn } from "../../shared/cn.js";
import { Modal } from "./Modal.js";

export interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Confirm button label (default: "Confirm") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Override modal panel classes */
  className?: string;
  /** Override confirm button classes */
  confirmButtonClassName?: string;
  /** Override cancel button classes */
  cancelButtonClassName?: string;
}

const baseBtnCls =
  "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-32";

export function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  className,
  confirmButtonClassName,
  cancelButtonClassName,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className={className}>
      <div className="mt-2 flex flex-col items-center gap-3 text-center sm:gap-4">
        <div className="rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <p className="text-base font-medium whitespace-pre-wrap text-gray-900 dark:text-gray-100 sm:text-lg">
          {message}
        </p>
        <div className="mt-4 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            className={cn(
              baseBtnCls,
              "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
              cancelButtonClassName,
            )}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              baseBtnCls,
              "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
              confirmButtonClassName,
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
