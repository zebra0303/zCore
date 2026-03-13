import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 z-50 m-auto flex max-h-[85vh] w-[calc(100%-2rem)] max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl backdrop:bg-black/50 dark:bg-gray-800 sm:w-full",
        className,
      )}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {title && (
        <div className="pr-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </div>
      )}
      <button
        onClick={onClose}
        className={cn(
          "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none",
          closeButtonClassName,
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      <div className="overflow-y-auto">{children}</div>
    </dialog>,
    document.body,
  );
}
