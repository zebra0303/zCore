/**
 * Extract a user-friendly error message from an unknown caught value.
 * Returns the trimmed Error message if non-empty, otherwise the fallback string.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}
