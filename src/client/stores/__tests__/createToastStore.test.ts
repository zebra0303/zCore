import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToastStore } from "../createToastStore.js";

describe("createToastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates independent store instances", () => {
    const store1 = createToastStore();
    const store2 = createToastStore();
    store1.getState().showToast("hello");
    expect(store1.getState().toasts).toHaveLength(1);
    expect(store2.getState().toasts).toHaveLength(0);
  });

  it("adds a toast with default type 'info'", () => {
    const store = createToastStore();
    store.getState().showToast("test message");
    const toasts = store.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]!.message).toBe("test message");
    expect(toasts[0]!.type).toBe("info");
  });

  it("adds a toast with specified type", () => {
    const store = createToastStore();
    store.getState().showToast("error!", "error");
    expect(store.getState().toasts[0]!.type).toBe("error");
  });

  it("auto-removes toast after duration", () => {
    const store = createToastStore({ duration: 2000 });
    store.getState().showToast("temporary");
    expect(store.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(2000);
    expect(store.getState().toasts).toHaveLength(0);
  });

  it("manually removes a toast", () => {
    const store = createToastStore();
    store.getState().showToast("keep");
    const id = store.getState().toasts[0]!.id;
    store.getState().removeToast(id);
    expect(store.getState().toasts).toHaveLength(0);
  });

  it("handles multiple toasts", () => {
    const store = createToastStore();
    store.getState().showToast("first");
    store.getState().showToast("second");
    store.getState().showToast("third");
    expect(store.getState().toasts).toHaveLength(3);
  });

  it("generates unique IDs for each toast", () => {
    const store = createToastStore();
    store.getState().showToast("a");
    store.getState().showToast("b");
    const ids = store.getState().toasts.map((t) => t.id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
