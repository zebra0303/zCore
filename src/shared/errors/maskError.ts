import { ApiError } from "./ApiError.js";

/**
 * Checks if the given error is a DOMException AbortError or standard Error AbortError.
 * Used to filter out cancellation errors from general API failures.
 */
export const isAbortError = (err: unknown): boolean =>
  (err instanceof DOMException && err.name === "AbortError") ||
  (err instanceof Error && err.name === "AbortError");

/**
 * Wraps an unknown error in an ApiError to mask internal details from the UI.
 * Re-throws AbortError as-is so callers can cleanly filter it out.
 * Safe to use in global error boundaries or catch blocks.
 *
 * @param err - The original unknown error
 * @param defaultMessage - A safe, user-facing error message
 */
export const createMaskedError = (
  err: unknown,
  defaultMessage = "An unexpected error occurred.",
): ApiError | DOMException => {
  if (err instanceof ApiError) {
    return err;
  }

  // Re-throw AbortError as-is so callers can filter it without unwrapping
  if (isAbortError(err)) {
    return err as DOMException;
  }

  // Log the original error internally for debugging, but don't expose it to the UI
  console.error("[Internal Error Log]:", err);

  return new ApiError(defaultMessage, 500, { code: "INTERNAL_ERROR" });
};
