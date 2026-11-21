import { ApiError } from "./ApiError.js";

export interface MaskErrorOptions {
  /** Optional custom logger (defaults to console.error; pass null to silence) */
  logger?: ((err: unknown) => void) | null;
  /** When true, masks ApiError instances with HTTP status >= 500 */
  maskServerErrors?: boolean;
}

/**
 * Checks if the given error is an AbortError (cross-realm safe via name check).
 * Used to filter out cancellation errors from general API failures.
 */
export const isAbortError = (err: unknown): boolean =>
  typeof err === "object" && err !== null && "name" in err && err.name === "AbortError";

const defaultLogger = (e: unknown): void => {
  console.error("[Internal Error Log]:", e);
};

/**
 * Wraps an unknown error in an ApiError to mask internal details from the UI.
 * Re-throws AbortError as-is so callers can cleanly filter it out.
 * Safe to use in global error boundaries or catch blocks.
 *
 * @param err - The original unknown error
 * @param defaultMessage - A safe, user-facing error message
 * @param options - Optional masking and logging configuration
 */
export const createMaskedError = (
  err: unknown,
  defaultMessage = "An unexpected error occurred.",
  options: MaskErrorOptions = {},
): ApiError | Error | DOMException => {
  if (err instanceof ApiError) {
    if (options.maskServerErrors && err.status >= 500) {
      if (options.logger !== null) {
        (options.logger ?? defaultLogger)(err);
      }
      return new ApiError(defaultMessage, err.status, { code: "INTERNAL_ERROR" });
    }
    return err;
  }

  // Re-throw AbortError as-is so callers can filter it without unwrapping
  if (isAbortError(err)) {
    return err as Error | DOMException;
  }

  // Log the original error internally for debugging, but don't expose it to the UI
  if (options.logger !== null) {
    (options.logger ?? defaultLogger)(err);
  }

  return new ApiError(defaultMessage, 500, { code: "INTERNAL_ERROR" });
};
