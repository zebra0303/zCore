import { describe, it, expect } from "vitest";
import { parseLinkSegments } from "../text/linkify.js";

describe("parseLinkSegments", () => {
  it("returns empty array for empty string", () => {
    expect(parseLinkSegments("")).toEqual([]);
  });

  it("returns single plain text segment when no URLs", () => {
    expect(parseLinkSegments("Hello world")).toEqual([
      { text: "Hello world", isUrl: false },
    ]);
  });

  it("detects a single URL", () => {
    const result = parseLinkSegments("Visit https://example.com now");
    expect(result).toEqual([
      { text: "Visit ", isUrl: false },
      { text: "https://example.com", isUrl: true },
      { text: " now", isUrl: false },
    ]);
  });

  it("detects multiple URLs", () => {
    const result = parseLinkSegments(
      "Go to https://a.com and http://b.com end",
    );
    expect(result).toHaveLength(5);
    expect(result[1]).toEqual({ text: "https://a.com", isUrl: true });
    expect(result[3]).toEqual({ text: "http://b.com", isUrl: true });
  });

  it("handles URL at start of text", () => {
    const result = parseLinkSegments("https://example.com is great");
    expect(result[0]).toEqual({ text: "https://example.com", isUrl: true });
  });

  it("handles URL at end of text", () => {
    const result = parseLinkSegments("go to https://example.com");
    expect(result[result.length - 1]).toEqual({
      text: "https://example.com",
      isUrl: true,
    });
  });

  it("handles URL with path and query", () => {
    const result = parseLinkSegments(
      "see https://example.com/path?q=1&b=2 here",
    );
    expect(result[1]).toEqual({
      text: "https://example.com/path?q=1&b=2",
      isUrl: true,
    });
  });

  it("does not match non-http protocols", () => {
    const result = parseLinkSegments("use ftp://example.com here");
    expect(result).toEqual([
      { text: "use ftp://example.com here", isUrl: false },
    ]);
  });
});
