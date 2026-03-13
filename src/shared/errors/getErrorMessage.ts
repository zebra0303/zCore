/**
 * Extract a user-friendly error message from an unknown caught value.
 * Returns the Error's message if available, otherwise the fallback string.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
