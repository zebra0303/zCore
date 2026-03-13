import { describe, it, expect } from "vitest";
import { buildPageList } from "../Pagination.js";

describe("buildPageList", () => {
  it("returns all pages when totalPages <= 5 and current is middle", () => {
    // delta=2, so from page 3: pages 1-5 are all within range
    expect(buildPageList(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns all pages when totalPages is 1", () => {
    expect(buildPageList(1, 1)).toEqual([1]);
  });

  it("shows ellipsis for pages far from current", () => {
    const pages = buildPageList(1, 10);
    // Should be [1, 2, 3, "...", 10]
    expect(pages[0]).toBe(1);
    expect(pages).toContain("...");
    expect(pages[pages.length - 1]).toBe(10);
  });

  it("shows ellipsis on both sides when current is in the middle", () => {
    const pages = buildPageList(5, 10);
    // [1, "...", 3, 4, 5, 6, 7, "...", 10]
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(10);
    expect(pages.filter((p) => p === "...").length).toBe(2);
    expect(pages).toContain(5);
  });

  it("shows no left ellipsis when near the start", () => {
    const pages = buildPageList(3, 10);
    // [1, 2, 3, 4, 5, "...", 10]
    expect(pages[0]).toBe(1);
    expect(pages[1]).toBe(2);
    expect(pages.filter((p) => p === "...").length).toBe(1);
  });

  it("shows no right ellipsis when near the end", () => {
    const pages = buildPageList(8, 10);
    // [1, "...", 6, 7, 8, 9, 10]
    expect(pages[pages.length - 1]).toBe(10);
    expect(pages[pages.length - 2]).toBe(9);
    expect(pages.filter((p) => p === "...").length).toBe(1);
  });

  it("handles totalPages of 2", () => {
    expect(buildPageList(1, 2)).toEqual([1, 2]);
  });

  it("never has consecutive ellipses", () => {
    for (let total = 1; total <= 20; total++) {
      for (let current = 1; current <= total; current++) {
        const pages = buildPageList(current, total);
        for (let i = 1; i < pages.length; i++) {
          expect(pages[i] === "..." && pages[i - 1] === "...").toBe(false);
        }
      }
    }
  });
});
