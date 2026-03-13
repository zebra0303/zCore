import { describe, it, expect } from "vitest";
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../errors.js";

describe("AppError hierarchy", () => {
  it("AppError has default values", () => {
    const err = new AppError("Something went wrong");
    expect(err.message).toBe("Something went wrong");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("AppError accepts custom statusCode and code", () => {
    const err = new AppError("Custom error", 422, "UNPROCESSABLE");
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("UNPROCESSABLE");
  });

  it("AppError.toJSON() returns code and message", () => {
    const err = new AppError("fail", 500, "INTERNAL_ERROR");
    expect(err.toJSON()).toEqual({
      code: "INTERNAL_ERROR",
      message: "fail",
    });
  });

  it("BadRequestError defaults to 400", () => {
    const err = new BadRequestError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Bad Request");
    expect(err.name).toBe("BadRequestError");
    expect(err).toBeInstanceOf(AppError);
  });

  it("BadRequestError accepts custom message", () => {
    const err = new BadRequestError("Invalid input");
    expect(err.message).toBe("Invalid input");
    expect(err.statusCode).toBe(400);
  });

  it("UnauthorizedError defaults to 401", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Unauthorized");
    expect(err.name).toBe("UnauthorizedError");
    expect(err).toBeInstanceOf(AppError);
  });

  it("ForbiddenError defaults to 403", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Forbidden");
    expect(err.name).toBe("ForbiddenError");
    expect(err).toBeInstanceOf(AppError);
  });

  it("NotFoundError defaults to 404", () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Not Found");
    expect(err.name).toBe("NotFoundError");
    expect(err).toBeInstanceOf(AppError);
  });

  it("ConflictError defaults to 409", () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
    expect(err.message).toBe("Conflict");
    expect(err.name).toBe("ConflictError");
    expect(err).toBeInstanceOf(AppError);
  });

  it("all subclasses are instanceof AppError and Error", () => {
    const errors = [
      new BadRequestError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new NotFoundError(),
      new ConflictError(),
    ];
    for (const err of errors) {
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(Error);
    }
  });

  it("toJSON works on subclasses", () => {
    const err = new NotFoundError("User not found");
    expect(err.toJSON()).toEqual({
      code: "NOT_FOUND",
      message: "User not found",
    });
  });

  it("stack trace is captured", () => {
    const err = new BadRequestError("test");
    expect(err.stack).toBeDefined();
    expect(err.stack).toContain("BadRequestError");
  });
});
