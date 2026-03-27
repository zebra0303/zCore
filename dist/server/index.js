// src/server/errors.ts
var AppError = class extends Error {
  statusCode;
  code;
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
  /** Serialize to a JSON-friendly object for API responses. */
  toJSON() {
    return {
      code: this.code,
      message: this.message
    };
  }
};
var BadRequestError = class extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
};
var UnauthorizedError = class extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
};
var ConflictError = class extends AppError {
  constructor(message = "Conflict") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
};
export {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
};
//# sourceMappingURL=index.js.map