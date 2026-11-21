// src/server/errors.ts
var AppError = class extends Error {
  statusCode;
  code;
  details;
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details, options) {
    super(message, options);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== void 0) {
      this.details = details;
    }
  }
  /** Serialize to a JSON-friendly object for API responses. */
  toJSON() {
    const base = {
      code: this.code,
      message: this.message
    };
    if (this.details !== void 0) {
      base.details = this.details;
    }
    return base;
  }
};
var BadRequestError = class extends AppError {
  constructor(message = "Bad Request", details) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
};
var UnauthorizedError = class extends AppError {
  constructor(message = "Unauthorized", details) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Forbidden", details) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Not Found", details) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
};
var ConflictError = class extends AppError {
  constructor(message = "Conflict", details) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
};
var UnprocessableEntityError = class extends AppError {
  constructor(message = "Unprocessable Entity", details) {
    super(message, 422, "UNPROCESSABLE_ENTITY", details);
    this.name = "UnprocessableEntityError";
  }
};
var TooManyRequestsError = class extends AppError {
  constructor(message = "Too Many Requests", details) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
    this.name = "TooManyRequestsError";
  }
};

// src/server/security.ts
import crypto from "crypto";
import dns from "dns/promises";
import net from "net";
function resolveJwtSecret(envSecret, nodeEnv = process.env.NODE_ENV) {
  const trimmed = envSecret?.trim();
  if (trimmed && trimmed.length >= 16) {
    return trimmed;
  }
  if (nodeEnv === "production") {
    throw new Error(
      "FATAL: JWT_SECRET environment variable must be set (at least 16 characters) in production."
    );
  }
  if (trimmed) {
    return trimmed;
  }
  return crypto.randomBytes(32).toString("hex");
}
function isPrivateOrReservedIp(rawIp) {
  const cleaned = rawIp.trim().replace(/^\[|\]$/g, "").split("%")[0]?.toLowerCase() ?? "";
  if (!cleaned) return true;
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
        const ipv4 = `${hi >> 8 & 255}.${hi & 255}.${lo >> 8 & 255}.${lo & 255}`;
        return isPrivateOrReservedIpv4(ipv4);
      }
    }
    return true;
  }
  if (net.isIPv4(cleaned)) {
    return isPrivateOrReservedIpv4(cleaned);
  }
  if (net.isIPv6(cleaned)) {
    if (cleaned === "::1" || cleaned === "::" || /^0+(:0+)*(:0*1)?$/.test(cleaned)) {
      return true;
    }
    if (/^(fc|fd)/i.test(cleaned)) return true;
    if (/^fe[89ab]/i.test(cleaned)) return true;
    if (/^ff/i.test(cleaned)) return true;
    return false;
  }
  return true;
}
function isPrivateOrReservedIpv4(ip) {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a = 0, b = 0] = parts;
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}
async function assertSafeUrl(rawUrl, allowLocal = false) {
  let parsed;
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
  let addresses;
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
async function safeFetch(rawUrl, options = {}) {
  const { allowLocal = false, maxRedirects = 3, timeoutMs = 1e4, ...fetchInit } = options;
  let currentUrl = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertSafeUrl(currentUrl, allowLocal);
    const signal = fetchInit.signal ?? AbortSignal.timeout(timeoutMs);
    const res = await fetch(currentUrl, {
      ...fetchInit,
      redirect: "manual",
      signal
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
export {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
  assertSafeUrl,
  isPrivateOrReservedIp,
  resolveJwtSecret,
  safeFetch
};
//# sourceMappingURL=index.js.map