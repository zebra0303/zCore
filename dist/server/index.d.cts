/**
 * Framework-agnostic HTTP error hierarchy.
 * Works with Express, Hono, or any Node.js server framework.
 */
declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown, options?: ErrorOptions);
    /** Serialize to a JSON-friendly object for API responses. */
    toJSON(): {
        code: string;
        message: string;
        details?: unknown;
    };
}
declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class UnauthorizedError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class ForbiddenError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class NotFoundError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class UnprocessableEntityError extends AppError {
    constructor(message?: string, details?: unknown);
}
declare class TooManyRequestsError extends AppError {
    constructor(message?: string, details?: unknown);
}

/**
 * Resolve JWT signing secret with fail-fast protection in production.
 * Generates an ephemeral random secret in non-production environments to prevent
 * predictable hardcoded fallback secrets.
 */
declare function resolveJwtSecret(envSecret: string | undefined, nodeEnv?: string | undefined): string;
/**
 * Determine whether an IPv4 or IPv6 address belongs to a private, loopback,
 * link-local, CGNAT, multicast, or unspecified range.
 */
declare function isPrivateOrReservedIp(rawIp: string): boolean;
interface SafeFetchOptions extends RequestInit {
    /** Allow localhost/private IPs (for local development/tests only) */
    allowLocal?: boolean;
    /** Maximum number of HTTP redirects to follow (default: 3) */
    maxRedirects?: number;
    /** Timeout in milliseconds (default: 10000) */
    timeoutMs?: number;
}
/**
 * Validate a URL against SSRF by inspecting scheme, hostname, and DNS-resolved IP addresses.
 */
declare function assertSafeUrl(rawUrl: string, allowLocal?: boolean): Promise<URL>;
/**
 * SSRF-hardened fetch wrapper that validates DNS-resolved IPs and re-validates every redirect hop.
 */
declare function safeFetch(rawUrl: string, options?: SafeFetchOptions): Promise<Response>;

export { AppError, BadRequestError, ConflictError, ForbiddenError, NotFoundError, type SafeFetchOptions, TooManyRequestsError, UnauthorizedError, UnprocessableEntityError, assertSafeUrl, isPrivateOrReservedIp, resolveJwtSecret, safeFetch };
