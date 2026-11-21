import crypto from "node:crypto";
import dns from "node:dns/promises";
import net from "node:net";

/**
 * Resolve JWT signing secret with fail-fast protection in production.
 * Generates an ephemeral random secret in non-production environments to prevent
 * predictable hardcoded fallback secrets.
 */
export function resolveJwtSecret(
  envSecret: string | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  const trimmed = envSecret?.trim();
  if (trimmed && trimmed.length >= 16) {
    return trimmed;
  }
  if (nodeEnv === "production") {
    throw new Error(
      "FATAL: JWT_SECRET environment variable must be set (at least 16 characters) in production.",
    );
  }
  if (trimmed) {
    return trimmed;
  }
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Determine whether an IPv4 or IPv6 address belongs to a private, loopback,
 * link-local, CGNAT, multicast, or unspecified range.
 */
export function isPrivateOrReservedIp(rawIp: string): boolean {
  const cleaned =
    rawIp
      .trim()
      .replace(/^\[|\]$/g, "")
      .split("%")[0]
      ?.toLowerCase() ?? "";
  if (!cleaned) return true;

  // Handle IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (cleaned.startsWith("::ffff:")) {
    const mapped = cleaned.slice(7);
    if (net.isIPv4(mapped)) {
      return isPrivateOrReservedIpv4(mapped);
    }
    const hexParts = mapped.split(":");
    if (hexParts.length === 2) {
      const hi = Number.parseInt(hexParts[0] ?? "", 16);
      const lo = Number.parseInt(hexParts[1] ?? "", 16);
      if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
        const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isPrivateOrReservedIpv4(ipv4);
      }
    }
    return true;
  }

  if (net.isIPv4(cleaned)) {
    return isPrivateOrReservedIpv4(cleaned);
  }

  if (net.isIPv6(cleaned)) {
    // Loopback (::1), unspecified (::), ULA (fc00::/7), link-local (fe80::/10), multicast (ff00::/8)
    if (cleaned === "::1" || cleaned === "::" || /^0+(:0+)*(:0*1)?$/.test(cleaned)) {
      return true;
    }
    if (/^(fc|fd)/i.test(cleaned)) return true;
    if (/^fe[89ab]/i.test(cleaned)) return true;
    if (/^ff/i.test(cleaned)) return true;
    return false;
  }

  // Unrecognized IP format is treated conservatively as unsafe
  return true;
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a = 0, b = 0] = parts;
  if (a === 0) return true; // 0.0.0.0/8 (unspecified)
  if (a === 10) return true; // 10.0.0.0/8 (RFC1918)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
  if (a === 127) return true; // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 (RFC1918)
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 (RFC1918)
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

export interface SafeFetchOptions extends RequestInit {
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
export async function assertSafeUrl(rawUrl: string, allowLocal = false): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("ERR_INVALID_URL_FORMAT");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("ERR_INVALID_PROTOCOL");
  }

  if (allowLocal) return parsed;

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, "");
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("ERR_LOCALHOST_FORBIDDEN");
  }

  const literalIp = host.replace(/^\[|\]$/g, "");
  if (net.isIP(literalIp)) {
    if (isPrivateOrReservedIp(literalIp)) {
      throw new Error("ERR_PRIVATE_IP_FORBIDDEN");
    }
    return parsed;
  }

  // Resolve DNS records and reject if any A/AAAA record points to a private/loopback IP
  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(host, { all: true });
  } catch {
    throw new Error("ERR_DNS_RESOLUTION_FAILED");
  }

  if (addresses.length === 0) {
    throw new Error("ERR_DNS_RESOLUTION_FAILED");
  }

  for (const record of addresses) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error("ERR_PRIVATE_IP_FORBIDDEN");
    }
  }

  return parsed;
}

/**
 * SSRF-hardened fetch wrapper that validates DNS-resolved IPs and re-validates every redirect hop.
 */
export async function safeFetch(rawUrl: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { allowLocal = false, maxRedirects = 3, timeoutMs = 10000, ...fetchInit } = options;

  let currentUrl = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertSafeUrl(currentUrl, allowLocal);

    const signal = fetchInit.signal ?? AbortSignal.timeout(timeoutMs);
    const res = await fetch(currentUrl, {
      ...fetchInit,
      redirect: "manual",
      signal,
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      if (hop === maxRedirects) {
        throw new Error("ERR_TOO_MANY_REDIRECTS");
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return res;
  }

  throw new Error("ERR_TOO_MANY_REDIRECTS");
}
