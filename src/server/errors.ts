/**
 * Framework-agnostic HTTP error hierarchy.
 * Works with Express, Hono, or any Node.js server framework.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    // Ensure instanceof checks remain intact across transpilation targets
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }

  /** Serialize to a JSON-friendly object for API responses. */
  toJSON() {
    const base: { code: string; message: string; details?: unknown } = {
      code: this.code,
      message: this.message,
    };
    if (this.details !== undefined) {
      base.details = this.details;
    }
    return base;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: unknown) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", details?: unknown) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable Entity", details?: unknown) {
    super(message, 422, "UNPROCESSABLE_ENTITY", details);
    this.name = "UnprocessableEntityError";
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests", details?: unknown) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
    this.name = "TooManyRequestsError";
  }
}
