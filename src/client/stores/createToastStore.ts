import { create, type StoreApi, type UseBoundStore } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, durationOverride?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface ToastStoreOptions {
  /** Auto-dismiss duration in ms; pass <= 0 for persistent toasts (default: 3000) */
  duration?: number;
  /** Maximum number of simultaneous toasts (default: 10) */
  maxToasts?: number;
}

/**
 * Factory that creates an independent Zustand toast store.
 * Each project gets its own store instance — no shared global state.
 */
export function createToastStore(
  options: ToastStoreOptions = {},
): UseBoundStore<StoreApi<ToastState>> {
  const { duration = 3000, maxToasts = 10 } = options;
  // Track active auto-dismiss timers so manual removal cancels them cleanly
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let counter = 0;

  return create<ToastState>((set) => ({
    toasts: [],
    showToast: (message, type = "info", durationOverride) => {
      const id = `toast-${++counter}-${Date.now().toString(36)}`;
      const effectiveDuration = durationOverride ?? duration;

      set((state) => {
        const next = [...state.toasts, { id, message, type }];
        if (next.length > maxToasts) {
          const evicted = next.splice(0, next.length - maxToasts);
          for (const t of evicted) {
            const existingTimer = timers.get(t.id);
            if (existingTimer) {
              clearTimeout(existingTimer);
              timers.delete(t.id);
            }
          }
        }
        return { toasts: next };
      });

      if (effectiveDuration > 0) {
        const timer = setTimeout(() => {
          timers.delete(id);
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, effectiveDuration);
        timers.set(id, timer);
      }
    },
    removeToast: (id) => {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.delete(id);
      }
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },
    clearToasts: () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      set({ toasts: [] });
    },
  }));
}
