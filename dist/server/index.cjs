"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/index.ts
var server_exports = {};
__export(server_exports, {
  AppError: () => AppError,
  BadRequestError: () => BadRequestError,
  ConflictError: () => ConflictError,
  ForbiddenError: () => ForbiddenError,
  NotFoundError: () => NotFoundError,
  UnauthorizedError: () => UnauthorizedError
});
module.exports = __toCommonJS(server_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
});
//# sourceMappingURL=index.cjs.map