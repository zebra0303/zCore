import { describe, it, expect } from "vitest";
import { estimateReadingTime } from "../text/readingTime.js";

describe("estimateReadingTime", () => {
  it("returns minimum 1 minute for short text", () => {
    expect(estimateReadingTime("Hello")).toBe(1);
  });

  it("returns minimum 1 minute for empty text", () => {
    expect(estimateReadingTime("")).toBe(1);
  });

  it("estimates English text at ~200 words/min", () => {
    // 400 words -> ~2 minutes
    const words = Array.from({ length: 400 }, () => "word").join(" ");
    expect(estimateReadingTime(words)).toBe(2);
  });

  it("estimates Korean text at ~500 chars/min", () => {
    // 1000 Korean chars -> ~2 minutes
    const chars = "가".repeat(1000);
    expect(estimateReadingTime(chars)).toBe(2);
  });

  it("handles mixed Korean and English", () => {
    // 500 Korean chars (1min) + 200 English words (1min) = ~2min
    const korean = "가".repeat(500);
    const english = Array.from({ length: 200 }, () => "word").join(" ");
    expect(estimateReadingTime(`${korean} ${english}`)).toBe(2);
  });

  it("strips code blocks before counting", () => {
    const text = "intro ```const x = 1;\nconst y = 2;``` outro";
    // Only "intro" and "outro" are counted
    expect(estimateReadingTime(text)).toBe(1);
  });

  it("strips HTML tags before counting", () => {
    const text = "<p>Hello</p> <b>World</b>";
    expect(estimateReadingTime(text)).toBe(1);
  });

  it("strips image markdown before counting", () => {
    const text = "text ![alt](https://example.com/img.png) more";
    expect(estimateReadingTime(text)).toBe(1);
  });

  it("preserves link text for counting", () => {
    const text = "[link text](https://example.com)";
    expect(estimateReadingTime(text)).toBe(1);
  });
});
