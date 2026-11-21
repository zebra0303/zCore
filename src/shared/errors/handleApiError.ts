import { ApiError } from "./ApiError.js";

/**
 * Extract error message and optional parsed payload from a failed HTTP Response.
 * Supports flat `{ error: string }`, nested `{ error: { code, message } }` (AppError.toJSON),
 * `{ message: string }`, HTML `<title>`, and short plain-text bodies.
 */
export async function extractResponseError(
  response: Response,
  fallback: string,
): Promise<{ message: string; details?: unknown }> {
  let parsed: unknown;
  let rawText = "";

  // Support both real Fetch Responses (.text) and lightweight test mocks (.json only)
  if (typeof response.text === "function") {
    rawText = await response.text().catch(() => "");
    if (!rawText) {
      return { message: fallback };
    }
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Response body is not JSON; try HTML <title> or short plain text
      const titleMatch = /<title>(.*?)<\/title>/i.exec(rawText);
      if (titleMatch?.[1]?.trim()) {
        return { message: titleMatch[1].trim() };
      }
      const trimmed = rawText.trim();
      if (!trimmed.startsWith("<") && trimmed.length > 0 && trimmed.length < 200) {
        return { message: trimmed };
      }
      return { message: fallback };
    }
  } else if (typeof response.json === "function") {
    try {
      parsed = await response.json();
    } catch {
      return { message: fallback };
    }
  } else {
    return { message: fallback };
  }

  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.error === "string" && obj.error.trim()) {
      return { message: obj.error.trim(), details: parsed };
    }
    // Support @zebra/core ApiResponse / AppError.toJSON shape: { error: { code, message } }
    if (typeof obj.error === "object" && obj.error !== null) {
      const nested = obj.error as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return { message: nested.message.trim(), details: parsed };
      }
    }
    if (typeof obj.message === "string" && obj.message.trim()) {
      return { message: obj.message.trim(), details: parsed };
    }
    return { message: fallback, details: parsed };
  }

  return { message: fallback };
}

/**
 * Parse an error response and throw an ApiError.
 * Attempts to extract a message from JSON body fields: `error`, `error.message`, `message`.
 * Falls back to statusText if the body is not JSON.
 */
export async function handleApiError(
  response: Response,
  defaultMessage = "API request failed",
): Promise<never> {
  const fallback = response.statusText
    ? `${defaultMessage}: ${response.statusText}`
    : defaultMessage;
  const { message, details } = await extractResponseError(response, fallback);
  throw new ApiError(message, response.status, details);
}
