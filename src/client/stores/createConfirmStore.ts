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
      return new Promise<boolean>((resolve) => {
        set({ isOpen: true, message, resolve });
      });
    },
    onConfirm: () => {
      const { resolve } = get();
      if (resolve) resolve(true);
      set({ isOpen: false, resolve: null });
    },
    onCancel: () => {
      const { resolve } = get();
      if (resolve) resolve(false);
      set({ isOpen: false, resolve: null });
    },
  }));
}
