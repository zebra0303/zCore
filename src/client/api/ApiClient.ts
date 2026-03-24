import { ApiError } from "../../shared/errors/ApiError.js";
export interface ApiClientOptions {
  /** Base URL prefix for all requests (default: "/api") */
  baseUrl?: string;
  /** Return extra headers (e.g. Authorization) to include in every request */
  getAuthHeaders?: () => Record<string, string>;
  /** Called when a 401 response is received (e.g. redirect to login) */
  onUnauthorized?: (path: string) => void;
  /** Credentials mode for fetch (default: "include") */
  credentials?: RequestCredentials;
  /** Number of retry attempts for 5xx or network errors (default: 0) */
  retries?: number;
  /** Base delay in milliseconds between retries using exponential backoff (default: 1000) */
  retryDelay?: number;
}

/**
 * Configurable fetch-based HTTP client.
 * Each project creates its own instance with project-specific auth strategy.
 *
 * @example
 * const api = new ApiClient({
 *   getAuthHeaders: () => {
 *     const token = localStorage.getItem("token");
 *     return token ? { Authorization: `Bearer ${token}` } : {};
 *   },
 *   onUnauthorized: () => window.location.href = "/login",
 *   retries: 3, // Automatically retry failed requests (5xx)
 * });
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
    this.onUnauthorized = options.onUnauthorized ?? (() => {});
    this.credentials = options.credentials ?? "include";
    this.retries = options.retries ?? 0;
    this.retryDelay = options.retryDelay ?? 1000;
  }

  /** Extract error message from a failed response. */
  private async extractErrorMessage(
    res: Response,
    fallback: string,
  ): Promise<string> {
    const text = await res.text().catch(() => "");
    if (!text) return fallback;

    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        if (typeof obj["error"] === "string" && obj["error"].trim()) {
          return obj["error"];
        }
        if (typeof obj["message"] === "string" && obj["message"].trim()) {
          return obj["message"];
        }
      }
    } catch {
      // Not JSON

      // Try to extract <title> if it's an HTML page (e.g., Cloudflare 503 page)
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }

      // If it's plain text (no HTML tags) and reasonably short, return it
      const trimmed = text.trim();
      if (
        !trimmed.startsWith("<") &&
        trimmed.length > 0 &&
        trimmed.length < 200
      ) {
        return trimmed;
      }
    }

    return fallback;
  }

  /** Build headers for a request. */
  private buildHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = { ...this.getAuthHeaders() };
    if (contentType) headers["Content-Type"] = contentType;
    return headers;
  }

  /** Handle non-ok response: fire unauthorized callback if 401, then throw. */
  private async handleError(res: Response, path: string): Promise<never> {
    if (res.status === 401) {
      this.onUnauthorized(path);
    }
    const fallback = `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}`;
    throw new ApiError(await this.extractErrorMessage(res, fallback), res.status);
  }

  /** Internal fetch wrapper with retry logic for 5xx and network errors */
  private async fetchWithRetry(
    path: string,
    init: RequestInit,
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;

    // Encourage JSON responses for errors
    const headers = { ...(init.headers as Record<string, string>) };
    if (!headers["Accept"]) {
      headers["Accept"] = "application/json";
    }
    init.headers = headers;

    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await fetch(url, init);
        // Retry on 5xx errors or 429 Too Many Requests
        if (!res.ok && (res.status >= 500 || res.status === 429)) {
          if (attempt < this.retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)),
            );
            continue;
          }
        }
        return res;
      } catch (error) {
        lastError = error;
        // Network error (fetch throws TypeError on network failure)
        if (attempt < this.retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)),
          );
          continue;
        }
      }
    }
    throw lastError || new Error("Request failed");
  }

  async get<T>(
    path: string,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const headers = { ...this.buildHeaders(), ...extraHeaders };
    const res = await this.fetchWithRetry(path, {
      method: "GET",
      headers,
      credentials: this.credentials,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.fetchWithRetry(path, {
      method: "POST",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.fetchWithRetry(path, {
      method: "PUT",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async delete<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.fetchWithRetry(path, {
      method: "DELETE",
      headers: this.buildHeaders(body ? "application/json" : undefined),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    // No Content-Type header — browser sets multipart boundary automatically
    const headers = this.buildHeaders();
    const res = await this.fetchWithRetry(path, {
      method: "POST",
      headers,
      credentials: this.credentials,
      body: formData,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }
}
