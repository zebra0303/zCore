/**
 * Represents an error from an HTTP API response.
 * Used on the client side to carry status code and response details.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}
