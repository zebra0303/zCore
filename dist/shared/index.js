// src/shared/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/shared/generateId.ts
import { uuidv7 } from "uuidv7";
function generateId() {
  return uuidv7();
}

// src/shared/slug.ts
function createSlug(text, fallback = "untitled") {
  const slug = text.toLowerCase().trim().replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug || fallback;
}
function createUniqueSlug(text, existingSlugs, fallback = "untitled") {
  const base = createSlug(text, fallback);
  if (!existingSlugs.includes(base)) return base;
  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

// src/shared/errors/ApiError.ts
var ApiError = class extends Error {
  status;
  details;
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
};

// src/shared/errors/handleApiError.ts
async function handleApiError(response, defaultMessage = "API request failed") {
  let message = defaultMessage;
  let details;
  try {
    const data = await response.json();
    if (typeof data === "object" && data !== null) {
      const obj = data;
      if (typeof obj.error === "string" && obj.error.trim()) {
        message = obj.error;
      } else if (typeof obj.message === "string" && obj.message.trim()) {
        message = obj.message;
      }
      details = data;
    }
  } catch {
    if (response.statusText) {
      message = `${defaultMessage}: ${response.statusText}`;
    }
  }
  throw new ApiError(message, response.status, details);
}

// src/shared/errors/getErrorMessage.ts
function getErrorMessage(err, fallback) {
  return err instanceof Error && err.message ? err.message : fallback;
}

// src/shared/errors/maskError.ts
var isAbortError = (err) => err instanceof DOMException && err.name === "AbortError" || err instanceof Error && err.name === "AbortError";
var createMaskedError = (err, defaultMessage = "An unexpected error occurred.") => {
  if (err instanceof ApiError) {
    return err;
  }
  if (isAbortError(err)) {
    return err;
  }
  console.error("[Internal Error Log]:", err);
  return new ApiError(defaultMessage, 500, { code: "INTERNAL_ERROR" });
};

// src/shared/text/stripMarkdown.ts
function stripMarkdown(content) {
  if (!content) return "";
  let text = content;
  text = text.replace(/```[\s\S]*?```/g, "");
  let prev;
  do {
    prev = text;
    text = text.replace(/<[^>]*>/g, "");
  } while (text !== prev);
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^>\s+/gm, "");
  text = text.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, "");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  text = text.replace(/^[\s-]*[-+*]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/^\s*\|.*$/gm, "");
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

// src/shared/text/obfuscate.ts
var obfuscate = (data) => {
  try {
    const encoded = encodeURIComponent(data);
    let result = "";
    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(encoded.charCodeAt(i) + 13);
    }
    return btoa(result);
  } catch {
    return "";
  }
};
var deobfuscate = (obfuscated) => {
  try {
    const decoded = atob(obfuscated);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) - 13);
    }
    return decodeURIComponent(result);
  } catch {
    return "";
  }
};

// src/shared/text/readingTime.ts
function estimateReadingTime(text) {
  let cleaned = text.replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  let prev = "";
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
  }
  cleaned = cleaned.trim();
  const koreanChars = (cleaned.match(/[\u3131-\uD79D]/g) ?? []).length;
  const nonKorean = cleaned.replace(/[\u3131-\uD79D]/g, " ");
  const englishWords = nonKorean.split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}

// src/shared/text/linkify.ts
var URL_REGEX = /(https?:\/\/[^\s]+)/g;
function parseLinkSegments(text) {
  if (!text) return [];
  const parts = text.split(URL_REGEX);
  const segments = [];
  for (const part of parts) {
    if (!part) continue;
    segments.push({ text: part, isUrl: URL_REGEX.test(part) });
    URL_REGEX.lastIndex = 0;
  }
  return segments;
}

// src/shared/date/formatDate.ts
var LOCALE_MAP = {
  en: "en-US",
  ko: "ko-KR"
};
function resolveLocale(locale) {
  return LOCALE_MAP[locale] ?? locale;
}
function formatDate(dateStr, locale = "en") {
  const resolved = resolveLocale(locale);
  return new Intl.DateTimeFormat(resolved, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateStr));
}
function formatDateShort(dateStr, locale = "en") {
  const resolved = resolveLocale(locale);
  return new Intl.DateTimeFormat(resolved, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(dateStr)).replace(/\s/g, "");
}

// src/shared/date/timeAgo.ts
var LOCALE_MAP2 = {
  en: "en-US",
  ko: "ko-KR"
};
var DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" }
];
function timeAgo(dateStr, locale = "en", now) {
  const resolved = LOCALE_MAP2[locale] ?? locale;
  const rtf = new Intl.RelativeTimeFormat(resolved, { numeric: "auto" });
  const date = new Date(dateStr);
  let duration = (date.getTime() - (now ?? Date.now())) / 1e3;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return formatDate(dateStr, locale);
}
export {
  ApiError,
  cn,
  createMaskedError,
  createSlug,
  createUniqueSlug,
  deobfuscate,
  estimateReadingTime,
  formatDate,
  formatDateShort,
  generateId,
  getErrorMessage,
  handleApiError,
  isAbortError,
  obfuscate,
  parseLinkSegments,
  stripMarkdown,
  timeAgo
};
//# sourceMappingURL=index.js.map