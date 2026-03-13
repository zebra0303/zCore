import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort } from "../date/formatDate.js";

describe("formatDate", () => {
  it("formats date in English", () => {
    const result = formatDate("2026-03-09", "en");
    expect(result).toContain("March");
    expect(result).toContain("9");
    expect(result).toContain("2026");
  });

  it("formats date in Korean", () => {
    const result = formatDate("2026-03-09", "ko");
    expect(result).toContain("3월");
    expect(result).toContain("9");
    expect(result).toContain("2026");
  });

  it("defaults to English locale", () => {
    const result = formatDate("2026-01-15");
    expect(result).toContain("January");
  });

  it("handles ISO date strings", () => {
    const result = formatDate("2026-06-15T10:30:00Z", "en");
    expect(result).toContain("June");
    expect(result).toContain("2026");
  });
});

describe("formatDateShort", () => {
  it("formats short date in English", () => {
    const result = formatDateShort("2026-03-09", "en");
    // en-US: "03/09/2026"
    expect(result).toContain("03");
    expect(result).toContain("09");
    expect(result).toContain("2026");
  });

  it("formats short date in Korean", () => {
    const result = formatDateShort("2026-03-09", "ko");
    // ko-KR: "2026.03.09." or "2026.03.09"
    expect(result).toContain("2026");
    expect(result).toContain("03");
    expect(result).toContain("09");
  });

  it("removes whitespace from output", () => {
    const result = formatDateShort("2026-03-09", "en");
    expect(result).not.toMatch(/\s/);
  });
});
