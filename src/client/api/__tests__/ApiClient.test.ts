import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiClient } from "../ApiClient.js";

// Mock global fetch
const mockFetch = vi.fn();

describe("ApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function okJson(data: unknown) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    } as Response);
  }

  function errorResponse(status: number, body?: unknown) {
    return Promise.resolve({
      ok: false,
      status,
      text: () => Promise.resolve(body ? JSON.stringify(body) : ""),
    } as Response);
  }

  it("GET: sends request with correct URL and headers", async () => {
    mockFetch.mockReturnValue(okJson({ id: 1 }));
    const api = new ApiClient({ baseUrl: "/api" });
    const result = await api.get<{ id: number }>("/users/1");

    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/users/1",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("POST: sends JSON body", async () => {
    mockFetch.mockReturnValue(okJson({ created: true }));
    const api = new ApiClient();
    await api.post("/items", { name: "test" });

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.body).toBe('{"name":"test"}');
  });

  it("PUT: sends JSON body", async () => {
    mockFetch.mockReturnValue(okJson({ updated: true }));
    const api = new ApiClient();
    await api.put("/items/1", { name: "updated" });

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("PUT");
    expect(opts.body).toBe('{"name":"updated"}');
  });

  it("DELETE: sends request", async () => {
    mockFetch.mockReturnValue(okJson({ deleted: true }));
    const api = new ApiClient();
    await api.delete("/items/1");

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("DELETE");
  });

  it("injects auth headers from getAuthHeaders", async () => {
    mockFetch.mockReturnValue(okJson({}));
    const api = new ApiClient({
      getAuthHeaders: () => ({ Authorization: "Bearer token123" }),
    });
    await api.get("/me");

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.headers.Authorization).toBe("Bearer token123");
  });

  it("throws on error response with parsed message", async () => {
    mockFetch.mockReturnValue(
      errorResponse(400, { error: "Invalid input" }),
    );
    const api = new ApiClient();
    await expect(api.get("/fail")).rejects.toThrow("Invalid input");
  });

  it("calls onUnauthorized on 401", async () => {
    mockFetch.mockReturnValue(errorResponse(401, { error: "Unauthorized" }));
    const onUnauthorized = vi.fn();
    const api = new ApiClient({ onUnauthorized });

    await expect(api.get("/secret")).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledWith("/secret");
  });

  it("does not call onUnauthorized on non-401 errors", async () => {
    mockFetch.mockReturnValue(errorResponse(403, { error: "Forbidden" }));
    const onUnauthorized = vi.fn();
    const api = new ApiClient({ onUnauthorized });

    await expect(api.get("/forbidden")).rejects.toThrow();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("upload: sends FormData without Content-Type header", async () => {
    mockFetch.mockReturnValue(okJson({ url: "/uploads/file.png" }));
    const api = new ApiClient();
    const fd = new FormData();
    await api.upload("/upload", fd);

    const [, opts] = mockFetch.mock.calls[0]!;
    expect(opts.method).toBe("POST");
    expect(opts.headers["Content-Type"]).toBeUndefined();
    expect(opts.body).toBe(fd);
  });

  it("uses custom baseUrl", async () => {
    mockFetch.mockReturnValue(okJson({}));
    const api = new ApiClient({ baseUrl: "https://api.example.com/v2" });
    await api.get("/users");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/v2/users",
      expect.anything(),
    );
  });
});
