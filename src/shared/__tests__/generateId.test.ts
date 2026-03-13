import { describe, it, expect } from "vitest";
import { generateId } from "../generateId.js";

describe("generateId", () => {
  it("returns a valid UUID string", () => {
    const id = generateId();
    // UUID format: 8-4-4-4-12 hex characters
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("generates time-sortable IDs (later ID > earlier ID)", () => {
    const id1 = generateId();
    const id2 = generateId();
    // UUID v7 is time-ordered, so lexicographic comparison works
    expect(id2 >= id1).toBe(true);
  });
});
