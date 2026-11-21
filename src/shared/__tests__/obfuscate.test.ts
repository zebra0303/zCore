import { describe, it, expect } from "vitest";
import { obfuscate, deobfuscate } from "../text/obfuscate.js";

describe("obfuscate / deobfuscate", () => {
  it("round-trips ASCII strings", () => {
    const original = "hello-world-123";
    const encoded = obfuscate(original);
    expect(encoded).not.toBe(original);
    expect(deobfuscate(encoded)).toBe(original);
  });

  it("round-trips Korean and Unicode JSON payloads", () => {
    const original = JSON.stringify({ nickname: "바둑왕", emoji: "⚫⚪" });
    const encoded = obfuscate(original);
    expect(deobfuscate(encoded)).toBe(original);
  });

  it("handles empty string", () => {
    expect(deobfuscate(obfuscate(""))).toBe("");
  });

  it("returns empty string on malformed base64 input", () => {
    expect(deobfuscate("%%%not-base64%%%")).toBe("");
  });
});
