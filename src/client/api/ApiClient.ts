export interface ApiClientOptions {
  /** Base URL prefix for all requests (default: "/api") */
  baseUrl?: string;
  /** Return extra headers (e.g. Authorization) to include in every request */
  getAuthHeaders?: () => Record<string, string>;
  /** Called when a 401 response is received (e.g. redirect to login) */
  onUnauthorized?: (path: string) => void;
  /** Credentials mode for fetch (default: "include") */
  credentials?: RequestCredentials;
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
 * });
 */
export class ApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;
  private onUnauthorized: (path: string) => void;
  private credentials: RequestCredentials;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "/api";
    this.getAuthHeaders = options.getAuthHeaders ?? (() => ({}));
    this.onUnauthorized = options.onUnauthorized ?? (() => {});
    this.credentials = options.credentials ?? "include";
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
      // not JSON
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
    throw new Error(
      await this.extractErrorMessage(res, `HTTP ${res.status}`),
    );
  }

  async get<T>(
    path: string,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    const headers = { ...this.buildHeaders(), ...extraHeaders };
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers,
      credentials: this.credentials,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.buildHeaders("application/json"),
      credentials: this.credentials,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }

  async delete<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
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
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      credentials: this.credentials,
      body: formData,
    });
    if (!res.ok) return this.handleError(res, path);
    return res.json() as Promise<T>;
  }
}
