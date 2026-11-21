import { describe, it, expect } from "vitest";
import { resolveJwtSecret, isPrivateOrReservedIp, assertSafeUrl } from "../security.js";

describe("resolveJwtSecret", () => {
  it("returns configured secret when valid", () => {
    expect(resolveJwtSecret("super-secret-jwt-key-1234", "production")).toBe(
      "super-secret-jwt-key-1234",
    );
  });

  it("throws in production when secret is missing or too short", () => {
    expect(() => resolveJwtSecret(undefined, "production")).toThrow(/JWT_SECRET/);
    expect(() => resolveJwtSecret("short", "production")).toThrow(/JWT_SECRET/);
  });

  it("generates an ephemeral random secret in development when unset", () => {
    const generated = resolveJwtSecret(undefined, "development");
    expect(generated.length).toBeGreaterThanOrEqual(32);
  });
});

describe("isPrivateOrReservedIp", () => {
  it("blocks IPv4 private, loopback, link-local, CGNAT, and unspecified ranges", () => {
    expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("127.255.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("0.0.0.0")).toBe(true);
    expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("172.16.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("192.168.1.1")).toBe(true);
    expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
    expect(isPrivateOrReservedIp("100.64.0.1")).toBe(true);
  });

  it("blocks IPv6 loopback, ULA, link-local, and IPv4-mapped loopback", () => {
    expect(isPrivateOrReservedIp("::1")).toBe(true);
    expect(isPrivateOrReservedIp("[::1]")).toBe(true);
    expect(isPrivateOrReservedIp("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateOrReservedIp("::ffff:7f00:1")).toBe(true);
    expect(isPrivateOrReservedIp("fc00::1")).toBe(true);
    expect(isPrivateOrReservedIp("fe80::1")).toBe(true);
  });

  it("allows public IPv4 and IPv6 addresses", () => {
    expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
    expect(isPrivateOrReservedIp("1.1.1.1")).toBe(false);
    expect(isPrivateOrReservedIp("2606:4700:4700::1111")).toBe(false);
  });
});

describe("assertSafeUrl", () => {
  it("rejects non-http protocols and localhost", async () => {
    await expect(assertSafeUrl("file:///etc/passwd")).rejects.toThrow("ERR_INVALID_PROTOCOL");
    await expect(assertSafeUrl("http://localhost:3000")).rejects.toThrow("ERR_LOCALHOST_FORBIDDEN");
    await expect(assertSafeUrl("http://127.0.0.2/admin")).rejects.toThrow(
      "ERR_PRIVATE_IP_FORBIDDEN",
    );
    await expect(assertSafeUrl("http://[::ffff:127.0.0.1]/")).rejects.toThrow(
      "ERR_PRIVATE_IP_FORBIDDEN",
    );
  });

  it("allows localhost when allowLocal is true", async () => {
    const parsed = await assertSafeUrl("http://localhost:3000/api", true);
    expect(parsed.hostname).toBe("localhost");
  });
});
