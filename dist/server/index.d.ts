/**
 * Framework-agnostic HTTP error hierarchy.
 * Works with Express, Hono, or any Node.js server framework.
 */
declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode?: number, code?: string);
    /** Serialize to a JSON-friendly object for API responses. */
    toJSON(): {
        code: string;
        message: string;
    };
}
declare class BadRequestError extends AppError {
    constructor(message?: string);
}
declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
declare class NotFoundError extends AppError {
    constructor(message?: string);
}
declare class ConflictError extends AppError {
    constructor(message?: string);
}

export { AppError, BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError };
