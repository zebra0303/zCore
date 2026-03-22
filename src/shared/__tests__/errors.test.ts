import { describe, it, expect } from "vitest";
import { ApiError } from "../errors/ApiError.js";
import { handleApiError } from "../errors/handleApiError.js";
import { getErrorMessage } from "../errors/getErrorMessage.js";

describe("ApiError", () => {
  it("creates an error with status and message", () => {
    const err = new ApiError("Not Found", 404);
    expect(err.message).toBe("Not Found");
    expect(err.status).toBe(404);
    expect(err.name).toBe("ApiError");
    expect(err.details).toBeUndefined();
  });

  it("includes optional details", () => {
    const details = { field: "email", reason: "invalid" };
    const err = new ApiError("Validation failed", 422, details);
    expect(err.details).toEqual(details);
  });

  it("is an instance of Error", () => {
    const err = new ApiError("Test", 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });
});

describe("handleApiError", () => {
  function mockResponse(
    status: number,
    body: unknown,
    statusText = "",
  ): Response {
    return {
      status,
      statusText,
      json: () => Promise.resolve(body),
    } as Response;
  }

  function mockNonJsonResponse(status: number, statusText = ""): Response {
    return {
      status,
      statusText,
      json: () => Promise.reject(new Error("not json")),
    } as Response;
  }

  it("throws ApiError with error field from JSON body", async () => {
    const res = mockResponse(400, { error: "Invalid input" });
    await expect(handleApiError(res)).rejects.toThrow(ApiError);
    await expect(handleApiError(res)).rejects.toMatchObject({
      message: "Invalid input",
      status: 400,
    });
  });

  it("falls back to message field from JSON body", async () => {
    const res = mockResponse(422, { message: "Validation error" });
    await expect(handleApiError(res)).rejects.toMatchObject({
      message: "Validation error",
      status: 422,
    });
  });

  it("uses default message for non-JSON response", async () => {
    const res = mockNonJsonResponse(500, "Internal Server Error");
    await expect(handleApiError(res, "Server error")).rejects.toMatchObject({
      message: "Server error: Internal Server Error",
      status: 500,
    });
  });

  it("uses default message when JSON has no error/message field", async () => {
    const res = mockResponse(403, { code: "FORBIDDEN" });
    await expect(handleApiError(res, "Forbidden")).rejects.toMatchObject({
      message: "Forbidden",
      status: 403,
    });
  });

  it("includes full response body as details", async () => {
    const body = { error: "Bad request", details: { field: "name" } };
    const res = mockResponse(400, body);
    try {
      await handleApiError(res);
    } catch (err) {
      expect((err as ApiError).details).toEqual(body);
    }
  });

  it("ignores empty error string in JSON body", async () => {
    const res = mockResponse(400, { error: "  " });
    await expect(handleApiError(res, "Default message")).rejects.toMatchObject({
      message: "Default message",
    });
  });
});

describe("getErrorMessage", () => {
  it("returns Error message when available", () => {
    expect(getErrorMessage(new Error("Something failed"), "fallback")).toBe(
      "Something failed",
    );
  });

  it("returns fallback for non-Error value", () => {
    expect(getErrorMessage("string error", "fallback")).toBe("fallback");
    expect(getErrorMessage(42, "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("returns fallback for Error with empty message", () => {
    expect(getErrorMessage(new Error(""), "fallback")).toBe("fallback");
  });

  it("works with ApiError subclass", () => {
    const err = new ApiError("API failed", 500);
    expect(getErrorMessage(err, "fallback")).toBe("API failed");
  });
});
