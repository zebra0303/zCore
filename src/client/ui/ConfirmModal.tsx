import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button.js";
import { cn } from "../../shared/cn.js";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
  className?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  showCancel = true,
  onConfirm,
  onCancel,
  variant = "danger",
  className,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCancelRef = useRef(onCancel);
  // Sync latest onCancel callback in effect to avoid mutating refs during render
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  // Handle Escape dismissal, basic focus restoration, and body scroll lock
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move initial focus inside dialog for keyboard/screen-reader accessibility
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancelRef.current();
        return;
      }
      // Basic Tab focus trap within the modal panel
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: "text-destructive bg-destructive/10",
    warning: "text-amber-600 bg-amber-500/10",
    info: "text-blue-600 bg-blue-500/10",
  };

  const buttonVariants = {
    danger: "destructive" as const,
    warning: "default" as const,
    info: "default" as const,
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        className={cn(
          "bg-card text-card-foreground border-border w-full max-w-sm overflow-hidden rounded-xl border shadow-lg",
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className={cn("rounded-full p-2", variantStyles[variant])}>
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h3>
          </div>
          <div id={descriptionId} className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {message}
          </div>
          <div className="flex justify-end gap-3">
            {showCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            <Button
              type="button"
              variant={buttonVariants[variant]}
              className={showCancel ? "" : "w-full"}
              // Only invoke onConfirm (do not spuriously fire onCancel on confirmation)
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render via portal in browser to avoid clipping inside transformed/overflow-hidden ancestors
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
