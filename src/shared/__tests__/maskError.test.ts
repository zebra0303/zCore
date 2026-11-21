import { describe, it, expect, vi } from "vitest";
import { ApiError, createMaskedError, isAbortError } from "../errors/index.js";

describe("isAbortError", () => {
  it("detects DOMException AbortError", () => {
    const err = new DOMException("The operation was aborted", "AbortError");
    expect(isAbortError(err)).toBe(true);
  });

  it("detects standard Error with AbortError name", () => {
    const err = new Error("Aborted");
    err.name = "AbortError";
    expect(isAbortError(err)).toBe(true);
  });

  it("returns false for regular errors and primitives", () => {
    expect(isAbortError(new Error("boom"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});

describe("createMaskedError", () => {
  it("returns existing ApiError untouched by default", () => {
    const apiErr = new ApiError("Invalid password", 401);
    expect(createMaskedError(apiErr)).toBe(apiErr);
  });

  it("masks 5xx ApiError when maskServerErrors is true", () => {
    const logger = vi.fn();
    const apiErr = new ApiError("SQLITE_CORRUPT: internal detail", 500);
    const masked = createMaskedError(apiErr, "Server error", {
      maskServerErrors: true,
      logger,
    });
    expect(masked).toBeInstanceOf(ApiError);
    expect(masked.message).toBe("Server error");
    expect((masked as ApiError).status).toBe(500);
    expect(logger).toHaveBeenCalledWith(apiErr);
  });

  it("re-returns AbortError as-is without logging", () => {
    const logger = vi.fn();
    const abortErr = new DOMException("Aborted", "AbortError");
    const result = createMaskedError(abortErr, "Fallback", { logger });
    expect(result).toBe(abortErr);
    expect(logger).not.toHaveBeenCalled();
  });

  it("masks unknown errors with custom default message and respects null logger", () => {
    const raw = new Error("ECONNREFUSED 127.0.0.1:5432");
    const masked = createMaskedError(raw, "Something went wrong", { logger: null });
    expect(masked).toBeInstanceOf(ApiError);
    expect(masked.message).toBe("Something went wrong");
    expect((masked as ApiError).status).toBe(500);
  });
});
