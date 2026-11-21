import { ClassValue } from 'clsx';

/** Merge Tailwind CSS classes with conflict resolution. */
declare function cn(...inputs: ClassValue[]): string;

/** Generate a time-sortable UUID v7 identifier. */
declare function generateId(): string;

/**
 * Convert text to a URL-safe kebab-case slug.
 * Supports Korean Hangul characters (syllables, consonants, vowels).
 * @param text - The source text to slugify
 * @param fallback - Fallback slug when text produces empty result (default: "untitled")
 */
declare function createSlug(text: string, fallback?: string): string;
/**
 * Create a unique slug by appending a numeric suffix if needed.
 * @param text - The source text to slugify
 * @param existingSlugs - Array of already-used slugs to check against
 * @param fallback - Fallback slug when text produces empty result (default: "untitled")
 */
declare function createUniqueSlug(text: string, existingSlugs: string[], fallback?: string): string;

/**
 * Represents an error from an HTTP API response.
 * Used on the client side to carry status code and response details.
 */
declare class ApiError extends Error {
    readonly status: number;
    readonly details?: unknown;
    constructor(message: string, status: number, details?: unknown);
}

/**
 * Extract error message and optional parsed payload from a failed HTTP Response.
 * Supports flat `{ error: string }`, nested `{ error: { code, message } }` (AppError.toJSON),
 * `{ message: string }`, HTML `<title>`, and short plain-text bodies.
 */
declare function extractResponseError(response: Response, fallback: string): Promise<{
    message: string;
    details?: unknown;
}>;
/**
 * Parse an error response and throw an ApiError.
 * Attempts to extract a message from JSON body fields: `error`, `error.message`, `message`.
 * Falls back to statusText if the body is not JSON.
 */
declare function handleApiError(response: Response, defaultMessage?: string): Promise<never>;

/**
 * Extract a user-friendly error message from an unknown caught value.
 * Returns the trimmed Error message if non-empty, otherwise the fallback string.
 */
declare function getErrorMessage(err: unknown, fallback: string): string;

interface MaskErrorOptions {
    /** Optional custom logger (defaults to console.error; pass null to silence) */
    logger?: ((err: unknown) => void) | null;
    /** When true, masks ApiError instances with HTTP status >= 500 */
    maskServerErrors?: boolean;
}
/**
 * Checks if the given error is an AbortError (cross-realm safe via name check).
 * Used to filter out cancellation errors from general API failures.
 */
declare const isAbortError: (err: unknown) => boolean;
/**
 * Wraps an unknown error in an ApiError to mask internal details from the UI.
 * Re-throws AbortError as-is so callers can cleanly filter it out.
 * Safe to use in global error boundaries or catch blocks.
 *
 * @param err - The original unknown error
 * @param defaultMessage - A safe, user-facing error message
 * @param options - Optional masking and logging configuration
 */
declare const createMaskedError: (err: unknown, defaultMessage?: string, options?: MaskErrorOptions) => ApiError | Error | DOMException;

/**
 * Regex-based Markdown stripper for generating plain text excerpts.
 * Removes HTML tags, code blocks, images, links, and common Markdown syntax.
 */
declare function stripMarkdown(content: string): string;

/**
 * Lightweight reversible obfuscation utility to avoid casual plaintext display in browser storage.
 * @security NOT cryptographically secure. Never use this for passwords, secret keys, JWTs, or PII.
 */
declare const obfuscate: (data: string) => string;
/**
 * Deobfuscates data previously obfuscated with `obfuscate`.
 */
declare const deobfuscate: (obfuscated: string) => string;

/**
 * Estimate reading time based on content.
 * Korean: ~500 chars/min, English: ~200 words/min.
 * Returns minimum 1 minute.
 */
declare function estimateReadingTime(text: string): number;

/** A segment of text that is either plain text or a URL. */
interface LinkSegment {
    text: string;
    isUrl: boolean;
}
/**
 * Parse text into segments, identifying URLs.
 * Pure function with no DOM dependency — UI rendering is left to the consumer.
 *
 * @example
 * parseLinkSegments("Visit https://example.com now")
 * // [{ text: "Visit ", isUrl: false }, { text: "https://example.com", isUrl: true }, { text: " now", isUrl: false }]
 */
declare function parseLinkSegments(text: string): LinkSegment[];

/**
 * Format a date string as a long date (e.g. "March 9, 2026" or "2026년 3월 9일").
 * Returns empty string for invalid date inputs instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
declare function formatDate(dateStr: string | number | Date, locale?: string): string;
/**
 * Format a date string as a short date (e.g. "03/09/2026" or "2026.03.09").
 * Returns empty string for invalid date inputs instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
declare function formatDateShort(dateStr: string | number | Date, locale?: string): string;

/**
 * Format a date as a relative time string (e.g. "3 hours ago", "2일 전").
 * Returns empty string for invalid dates instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 * @param now - Current time in ms (defaults to Date.now(), injectable for testing)
 */
declare function timeAgo(dateStr: string | number | Date, locale?: string, now?: number): string;

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}
interface PaginatedResponse<T> {
    success: boolean;
    data?: {
        items: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export { ApiError, type ApiResponse, type LinkSegment, type MaskErrorOptions, type PaginatedResponse, cn, createMaskedError, createSlug, createUniqueSlug, deobfuscate, estimateReadingTime, extractResponseError, formatDate, formatDateShort, generateId, getErrorMessage, handleApiError, isAbortError, obfuscate, parseLinkSegments, stripMarkdown, timeAgo };
