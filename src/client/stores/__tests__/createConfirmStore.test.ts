import { describe, it, expect } from "vitest";
import { createConfirmStore } from "../createConfirmStore.js";

describe("createConfirmStore", () => {
  it("creates independent store instances", () => {
    const store1 = createConfirmStore();
    const store2 = createConfirmStore();
    store1.getState().confirm("test");
    expect(store1.getState().isOpen).toBe(true);
    expect(store2.getState().isOpen).toBe(false);
  });

  it("starts closed with empty message", () => {
    const store = createConfirmStore();
    expect(store.getState().isOpen).toBe(false);
    expect(store.getState().message).toBe("");
  });

  it("opens with message on confirm()", () => {
    const store = createConfirmStore();
    store.getState().confirm("Delete this?");
    expect(store.getState().isOpen).toBe(true);
    expect(store.getState().message).toBe("Delete this?");
  });

  it("resolves true on onConfirm()", async () => {
    const store = createConfirmStore();
    const promise = store.getState().confirm("Sure?");
    store.getState().onConfirm();
    const result = await promise;
    expect(result).toBe(true);
    expect(store.getState().isOpen).toBe(false);
  });

  it("resolves false on onCancel()", async () => {
    const store = createConfirmStore();
    const promise = store.getState().confirm("Sure?");
    store.getState().onCancel();
    const result = await promise;
    expect(result).toBe(false);
    expect(store.getState().isOpen).toBe(false);
  });

  it("clears resolve after confirm/cancel", async () => {
    const store = createConfirmStore();
    const promise = store.getState().confirm("Sure?");
    store.getState().onConfirm();
    await promise;
    expect(store.getState().resolve).toBeNull();
  });
});
