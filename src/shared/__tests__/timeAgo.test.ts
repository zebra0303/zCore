import { describe, it, expect } from "vitest";
import { timeAgo } from "../date/timeAgo.js";

describe("timeAgo", () => {
  const NOW = new Date("2026-03-09T12:00:00Z").getTime();

  it("shows seconds ago", () => {
    const date = new Date(NOW - 30 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/30 seconds ago/);
  });

  it("shows minutes ago", () => {
    const date = new Date(NOW - 5 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/5 minutes ago/);
  });

  it("shows hours ago", () => {
    const date = new Date(NOW - 3 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/3 hours ago/);
  });

  it("shows days ago", () => {
    const date = new Date(NOW - 2 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/2 days ago/);
  });

  it("shows weeks ago", () => {
    const date = new Date(NOW - 14 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/2 weeks ago/);
  });

  it("shows months ago", () => {
    const date = new Date(NOW - 60 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/2 months ago/);
  });

  it("shows Korean relative time", () => {
    const date = new Date(NOW - 3 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "ko", NOW);
    expect(result).toMatch(/3시간 전/);
  });

  it("shows Korean days ago", () => {
    // Use 3 days to avoid "그저께" (day before yesterday) auto-wording
    const date = new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "ko", NOW);
    expect(result).toMatch(/3일 전/);
  });

  it("shows years ago for very old dates", () => {
    const date = new Date(NOW - 1100 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "en", NOW);
    expect(result).toMatch(/years? ago/);
  });

  it("shows Korean years ago", () => {
    const date = new Date(NOW - 730 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(date, "ko", NOW);
    expect(result).toMatch(/년 전/);
  });
});
