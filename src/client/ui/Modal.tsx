import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../shared/cn.js";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Override dialog panel classes */
  className?: string;
  /** Override close-button classes */
  closeButtonClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeButtonClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Guard !dialog.open to prevent InvalidStateError under React StrictMode double effects
    if (isOpen && !dialog.open && typeof dialog.showModal === "function") {
      dialog.showModal();
    }

    return () => {
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
    };
  }, [isOpen]);

  // Close only when clicking directly on the dialog backdrop, not inner content padding
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // SSR guard: document is unavailable during server rendering
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "bg-card text-card-foreground border-border fixed inset-0 z-50 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-sm rounded-2xl border p-0 shadow-2xl backdrop:bg-black/50 sm:w-full",
        className,
      )}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {/* Inner wrapper holds padding so clicking modal padding never triggers backdrop close */}
      <div className="relative flex max-h-[85vh] flex-col gap-4 p-6">
        {title && (
          <h2 id={titleId} className="pr-6 text-lg font-semibold">
            {title}
          </h2>
        )}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "focus-visible:ring-ring absolute top-4 right-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            closeButtonClassName,
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </button>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </dialog>,
    document.body,
  );
}
