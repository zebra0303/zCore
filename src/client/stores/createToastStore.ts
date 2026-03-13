import { create, type StoreApi, type UseBoundStore } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export interface ToastStoreOptions {
  /** Auto-dismiss duration in ms (default: 3000) */
  duration?: number;
}

/**
 * Factory that creates an independent Zustand toast store.
 * Each project gets its own store instance — no shared global state.
 */
export function createToastStore(
  options: ToastStoreOptions = {},
): UseBoundStore<StoreApi<ToastState>> {
  const { duration = 3000 } = options;

  return create<ToastState>((set) => ({
    toasts: [],
    showToast: (message, type = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },
  }));
}
