import { ApiError } from "./ApiError.js";

/**
 * Parse an error response and throw an ApiError.
 * Attempts to extract a message from JSON body fields: `error`, `message`.
 * Falls back to statusText if the body is not JSON.
 */
export async function handleApiError(
  response: Response,
  defaultMessage = "API request failed",
): Promise<never> {
  let message = defaultMessage;
  let details: unknown;

  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.error === "string" && obj.error.trim()) {
        message = obj.error;
      } else if (typeof obj.message === "string" && obj.message.trim()) {
        message = obj.message;
      }
      details = data;
    }
  } catch {
    // Response body is not JSON
    if (response.statusText) {
      message = `${defaultMessage}: ${response.statusText}`;
    }
  }

  throw new ApiError(message, response.status, details);
}
