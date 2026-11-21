import { ApiError } from "../../shared/errors/ApiError.js";
import { extractResponseError } from "../../shared/errors/handleApiError.js";
import { isAbortError } from "../../shared/errors/maskError.js";

export interface ApiClientOptions {
  /** Base URL prefix for all requests (default: "/api") */
  baseUrl?: string;
  /** Return extra headers (e.g. Authorization) to include in every request */
  getAuthHeaders?: () => Record<string, string>;
  /** Called when a 401 response is received (e.g. redirect to login) */
  onUnauthorized?: (path: string) => void;
  /** Credentials mode for fetch (default: "include") */
  credentials?: RequestCredentials;
  /** Number of retry attempts for idempotent 5xx/429/network errors (default: 0) */
  retries?: number;
  /** Base delay in milliseconds between retries using exponential backoff (default: 1000) */
  retryDelay?: number;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Per-request timeout in milliseconds */
  timeout?: number;
  /** Override retry count (defaults to client retries for idempotent methods, 0 otherwise) */
  retries?: number;
}

const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Join baseUrl and path without producing double slashes. */
function joinUrl(baseUrl: string, path: string): string {
  if (!path) return baseUrl;
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/** Sleep that aborts immediately when the provided AbortSignal fires. */
function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        signal.reason instanceof Error ? signal.reason : new DOMException("Aborted", "AbortError"),
      );
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        signal?.reason instanceof Error ? signal.reason : new DOMException("Aborted", "AbortError"),
      );
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Parse Retry-After header (delta-seconds or HTTP-date) into milliseconds. */
function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
}

/**
 * Configurable fetch-based HTTP client.
 * Each project creates its own instance with project-specific auth strategy.
 */
export class ApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;
  private onUnauthorized: (path: string) => void;
  private credentials: RequestCredentials;
  private retries: number;
  private retryDelay: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "/api";
    this.getAuthHeaders = options.getAuthHeaders ?? (() => ({}));
    this.onUnauthorized =
      options.onUnauthorized ??
      (() => {
        /* no-op */
      });
    this.credentials = options.credentials ?? "include";
    this.retries = Math.max(0, options.retries ?? 0);
    this.retryDelay = Math.max(0, options.retryDelay ?? 1000);
  }

  /** Build request headers without mutating caller objects. */
  private buildHeaders(
    contentType?: string,
    extraHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = { ...this.getAuthHeaders() };
    if (contentType) headers["Content-Type"] = contentType;
    if (extraHeaders) {
      Object.assign(headers, extraHeaders);
    }
    // Case-insensitive Accept default to encourage JSON error payloads
    const hasAccept = Object.keys(headers).some((k) => k.toLowerCase() === "accept");
    if (!hasAccept) {
      headers.Accept = "application/json";
    }
    return headers;
  }

  /** Safely parse JSON response while tolerating 204/205, empty bodies, and lightweight test mocks. */
  private async parseResponse<T>(res: Response): Promise<T> {
    const contentLength =
      typeof res.headers?.get === "function" ? res.headers.get("content-length") : null;
    if (res.status === 204 || res.status === 205 || contentLength === "0") {
      return undefined as T;
    }
    if (typeof res.text === "function") {
      const text = await res.text();
      if (!text.trim()) {
        return undefined as T;
      }
      return JSON.parse(text) as T;
    }
    return res.json() as Promise<T>;
  }

  /** Handle non-ok response: fire unauthorized callback if 401, then throw ApiError with details. */
  private async handleError(res: Response, path: string): Promise<never> {
    if (res.status === 401) {
      this.onUnauthorized(path);
    }
    const fallback = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
    const { message, details } = await extractResponseError(res, fallback);
    throw new ApiError(message, res.status, details);
  }

  /** Compose an AbortSignal from optional caller signal and timeout. */
  private createSignal(options?: ApiRequestOptions): AbortSignal | undefined {
    const signals: AbortSignal[] = [];
    if (options?.signal) signals.push(options.signal);
    if (options?.timeout !== undefined && options.timeout > 0) {
      signals.push(AbortSignal.timeout(options.timeout));
    }
    if (signals.length === 0) return undefined;
    if (signals.length === 1) return signals[0];
    return AbortSignal.any(signals);
  }

  /** Internal fetch wrapper with safe retry logic (idempotent methods only by default). */
  private async fetchWithRetry(
    path: string,
    init: RequestInit,
    requestOptions?: ApiRequestOptions,
  ): Promise<Response> {
    const url = joinUrl(this.baseUrl, path);
    const method = (init.method ?? "GET").toUpperCase();
    // Only auto-retry idempotent methods unless explicitly overridden per request
    const maxRetries = Math.max(
      0,
      requestOptions?.retries ?? (IDEMPOTENT_METHODS.has(method) ? this.retries : 0),
    );
    const signal = this.createSignal(requestOptions);

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, { ...init, signal });
        // Retry on 5xx errors or 429 Too Many Requests
        if (!res.ok && (res.status >= 500 || res.status === 429) && attempt < maxRetries) {
          const retryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
          const backoff = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * Math.min(250, backoff * 0.25));
          await abortableSleep(retryAfter ?? backoff + jitter, signal);
          continue;
        }
        return res;
      } catch (error) {
        // Never retry intentionally aborted requests
        if (isAbortError(error) || signal?.aborted) {
          throw error;
        }
        lastError = error;
        if (attempt < maxRetries) {
          const backoff = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * Math.min(250, backoff * 0.25));
          await abortableSleep(backoff + jitter, signal);
          continue;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Request failed");
  }

  /** Type guard distinguishing ApiRequestOptions from a plain headers record. */
  private isRequestOptions(
    value: Record<string, string> | ApiRequestOptions,
  ): value is ApiRequestOptions {
    return "headers" in value || "signal" in value || "timeout" in value || "retries" in value;
  }

  /** Normalize backward-compatible Record<string, string> or ApiRequestOptions parameter. */
  private normalizeOptions(
    headersOrOptions?: Record<string, string> | ApiRequestOptions,
  ): ApiRequestOptions | undefined {
    if (!headersOrOptions) return undefined;
    if (this.isRequestOptions(headersOrOptions)) {
      return headersOrOptions;
    }
    return { headers: headersOrOptions };
  }

  async get<T>(
    path: string,
    headersOrOptions?: Record<string, string> | ApiRequestOptions,
  ): Promise<T> {
    const opts = this.normalizeOptions(headersOrOptions);
    const res = await this.fetchWithRetry(
      path,
      {
        method: "GET",
        headers: this.buildHeaders(undefined, opts?.headers),
        credentials: this.credentials,
      },
      opts,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const hasBody = body !== undefined;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "POST",
        headers: this.buildHeaders(hasBody ? "application/json" : undefined, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : undefined,
      },
      options,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }

  async put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const hasBody = body !== undefined;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "PUT",
        headers: this.buildHeaders(hasBody ? "application/json" : undefined, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : undefined,
      },
      options,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }

  async patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const hasBody = body !== undefined;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "PATCH",
        headers: this.buildHeaders(hasBody ? "application/json" : undefined, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : undefined,
      },
      options,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }

  async delete<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    const hasBody = body !== undefined;
    const res = await this.fetchWithRetry(
      path,
      {
        method: "DELETE",
        headers: this.buildHeaders(hasBody ? "application/json" : undefined, options?.headers),
        credentials: this.credentials,
        body: hasBody ? JSON.stringify(body) : undefined,
      },
      options,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }

  async upload<T>(path: string, formData: FormData, options?: ApiRequestOptions): Promise<T> {
    // No Content-Type header — browser sets multipart boundary automatically
    const res = await this.fetchWithRetry(
      path,
      {
        method: "POST",
        headers: this.buildHeaders(undefined, options?.headers),
        credentials: this.credentials,
        body: formData,
      },
      options,
    );
    if (!res.ok) return this.handleError(res, path);
    return this.parseResponse<T>(res);
  }
}
