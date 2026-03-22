import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "../../shared/cn";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
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
  onConfirm,
  onCancel,
  variant = "danger",
  className,
}: ConfirmModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "bg-card text-card-foreground rounded-xl shadow-lg border w-full max-w-sm overflow-hidden",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full ${variantStyles[variant]}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          </div>
          <div className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {message}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={buttonVariants[variant]}
              onClick={() => {
                onConfirm();
                onCancel();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
