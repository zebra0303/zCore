import { create, type StoreApi, type UseBoundStore } from "zustand";

export interface ConfirmState {
  isOpen: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
  confirm: (message: string) => Promise<boolean>;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Factory that creates an independent Zustand confirm store.
 * Returns a Promise-based confirm dialog — call `confirm(msg)` and await the result.
 */
export function createConfirmStore(): UseBoundStore<StoreApi<ConfirmState>> {
  return create<ConfirmState>((set, get) => ({
    isOpen: false,
    message: "",
    resolve: null,
    confirm: (message: string) => {
      // Prevent dangling promises if confirm() is invoked while another dialog is already open
      const pendingResolve = get().resolve;
      if (pendingResolve) {
        pendingResolve(false);
      }
      return new Promise<boolean>((resolve) => {
        set({ isOpen: true, message, resolve });
      });
    },
    onConfirm: () => {
      const { resolve } = get();
      // Reset state before resolving to avoid re-entrancy races
      set({ isOpen: false, resolve: null });
      if (resolve) resolve(true);
    },
    onCancel: () => {
      const { resolve } = get();
      set({ isOpen: false, resolve: null });
      if (resolve) resolve(false);
    },
  }));
}
