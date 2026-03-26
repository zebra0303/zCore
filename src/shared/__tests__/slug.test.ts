import { describe, it, expect } from "vitest";
import { createSlug, createUniqueSlug } from "../slug.js";

describe("createSlug", () => {
  it("converts English text to kebab-case", () => {
    expect(createSlug("Hello World")).toBe("hello-world");
  });

  it("preserves Korean Hangul characters", () => {
    expect(createSlug("안녕하세요 세계")).toBe("안녕하세요-세계");
  });

  it("handles mixed Korean and English", () => {
    expect(createSlug("React 컴포넌트 가이드")).toBe("react-컴포넌트-가이드");
  });

  it("removes special characters", () => {
    expect(createSlug("Hello! @World# $2024")).toBe("hello-world-2024");
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(createSlug("hello   world---test")).toBe("hello-world-test");
  });

  it("trims leading and trailing hyphens", () => {
    expect(createSlug(" -hello world- ")).toBe("hello-world");
  });

  it("returns fallback for empty input", () => {
    expect(createSlug("")).toBe("untitled");
  });

  it("returns fallback for special-characters-only input", () => {
    expect(createSlug("!@#$%^&*()")).toBe("untitled");
  });

  it("handles underscores as separators", () => {
    expect(createSlug("hello_world_test")).toBe("hello-world-test");
  });

  it("preserves Hangul consonants and vowels (jamo)", () => {
    expect(createSlug("ㄱㄴㄷ ㅏㅓㅗ")).toBe("ㄱㄴㄷ-ㅏㅓㅗ");
  });
});

describe("createUniqueSlug", () => {
  it("returns base slug when no conflict", () => {
    expect(createUniqueSlug("Hello", ["other-slug"])).toBe("hello");
  });

  it("appends -2 on first conflict", () => {
    expect(createUniqueSlug("Hello", ["hello"])).toBe("hello-2");
  });

  it("increments suffix until unique", () => {
    expect(createUniqueSlug("Hello", ["hello", "hello-2", "hello-3"])).toBe("hello-4");
  });

  it("handles empty existing slugs array", () => {
    expect(createUniqueSlug("Test", [])).toBe("test");
  });
});
