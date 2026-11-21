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
  if (!text) return fallback;
  const slug = text.normalize("NFC").toLowerCase().trim().replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug || fallback;
}
function createUniqueSlug(text, existingSlugs, fallback = "untitled") {
  const base = createSlug(text, fallback);
  const existingSet = new Set(existingSlugs);
  if (!existingSet.has(base)) return base;
  let counter = 2;
  while (existingSet.has(`${base}-${counter}`)) {
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
async function extractResponseError(response, fallback) {
  let parsed;
  let rawText = "";
  if (typeof response.text === "function") {
    rawText = await response.text().catch(() => "");
    if (!rawText) {
      return { message: fallback };
    }
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const titleMatch = /<title>(.*?)<\/title>/i.exec(rawText);
      if (titleMatch?.[1]?.trim()) {
        return { message: titleMatch[1].trim() };
      }
      const trimmed = rawText.trim();
      if (!trimmed.startsWith("<") && trimmed.length > 0 && trimmed.length < 200) {
        return { message: trimmed };
      }
      return { message: fallback };
    }
  } else if (typeof response.json === "function") {
    try {
      parsed = await response.json();
    } catch {
      return { message: fallback };
    }
  } else {
    return { message: fallback };
  }
  if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed;
    if (typeof obj.error === "string" && obj.error.trim()) {
      return { message: obj.error.trim(), details: parsed };
    }
    if (typeof obj.error === "object" && obj.error !== null) {
      const nested = obj.error;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return { message: nested.message.trim(), details: parsed };
      }
    }
    if (typeof obj.message === "string" && obj.message.trim()) {
      return { message: obj.message.trim(), details: parsed };
    }
    return { message: fallback, details: parsed };
  }
  return { message: fallback };
}
async function handleApiError(response, defaultMessage = "API request failed") {
  const fallback = response.statusText ? `${defaultMessage}: ${response.statusText}` : defaultMessage;
  const { message, details } = await extractResponseError(response, fallback);
  throw new ApiError(message, response.status, details);
}

// src/shared/errors/getErrorMessage.ts
function getErrorMessage(err, fallback) {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}

// src/shared/errors/maskError.ts
var isAbortError = (err) => typeof err === "object" && err !== null && "name" in err && err.name === "AbortError";
var defaultLogger = (e) => {
  console.error("[Internal Error Log]:", e);
};
var createMaskedError = (err, defaultMessage = "An unexpected error occurred.", options = {}) => {
  if (err instanceof ApiError) {
    if (options.maskServerErrors && err.status >= 500) {
      if (options.logger !== null) {
        (options.logger ?? defaultLogger)(err);
      }
      return new ApiError(defaultMessage, err.status, { code: "INTERNAL_ERROR" });
    }
    return err;
  }
  if (isAbortError(err)) {
    return err;
  }
  if (options.logger !== null) {
    (options.logger ?? defaultLogger)(err);
  }
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
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  text = text.replace(/^\s*[-+*]\s+/gm, "");
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
  if (!text) return 1;
  const cleaned = stripMarkdown(text);
  const koreanChars = (cleaned.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) ?? []).length;
  const nonKorean = cleaned.replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, " ");
  const englishWords = nonKorean.split(/\s+/).filter(Boolean).length;
  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}

// src/shared/text/linkify.ts
var URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/;
var TRAILING_PUNCTUATION_REGEX = /[.,!?;:'")\]}>]+$/;
function isValidHttpUrl(candidate) {
  try {
    const parsed = new URL(candidate);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}
function trimTrailingPunctuation(raw) {
  let url = raw;
  let trailing = "";
  while (TRAILING_PUNCTUATION_REGEX.test(url)) {
    const lastChar = url.slice(-1);
    if (lastChar === ")") {
      const openCount = (url.match(/\(/g) ?? []).length;
      const closeCount = (url.match(/\)/g) ?? []).length;
      if (closeCount <= openCount) break;
    }
    trailing = lastChar + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}
function parseLinkSegments(text) {
  if (!text) return [];
  const parts = text.split(URL_SPLIT_REGEX);
  const segments = [];
  const pushPlain = (plain) => {
    if (!plain) return;
    const last = segments[segments.length - 1];
    if (last && !last.isUrl) {
      last.text += plain;
    } else {
      segments.push({ text: plain, isUrl: false });
    }
  };
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      const { url, trailing } = trimTrailingPunctuation(part);
      if (isValidHttpUrl(url)) {
        segments.push({ text: url, isUrl: true });
        pushPlain(trailing);
      } else {
        pushPlain(part);
      }
    } else {
      pushPlain(part);
    }
  }
  return segments;
}

// src/shared/date/formatDate.ts
var LOCALE_MAP = {
  en: "en-US",
  ko: "ko-KR"
};
var DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
var longFormatters = /* @__PURE__ */ new Map();
var shortFormatters = /* @__PURE__ */ new Map();
function resolveLocale(locale) {
  return LOCALE_MAP[locale] ?? locale;
}
function parseDateSafely(input) {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "string") {
    const match = DATE_ONLY_REGEX.exec(input.trim());
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const localDate = new Date(year, month, day);
      return Number.isNaN(localDate.getTime()) ? null : localDate;
    }
  }
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function formatDate(dateStr, locale = "en") {
  const date = parseDateSafely(dateStr);
  if (!date) return "";
  const resolved = resolveLocale(locale);
  let formatter = longFormatters.get(resolved);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(resolved, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    longFormatters.set(resolved, formatter);
  }
  return formatter.format(date);
}
function formatDateShort(dateStr, locale = "en") {
  const date = parseDateSafely(dateStr);
  if (!date) return "";
  const resolved = resolveLocale(locale);
  let formatter = shortFormatters.get(resolved);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(resolved, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    shortFormatters.set(resolved, formatter);
  }
  return formatter.format(date).replace(/\s/g, "");
}

// src/shared/date/timeAgo.ts
var relativeFormatters = /* @__PURE__ */ new Map();
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
  const date = parseDateSafely(dateStr);
  if (!date) return "";
  const resolved = resolveLocale(locale);
  let rtf = relativeFormatters.get(resolved);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(resolved, { numeric: "auto" });
    relativeFormatters.set(resolved, rtf);
  }
  let duration = (date.getTime() - (now ?? Date.now())) / 1e3;
  for (const division of DIVISIONS) {
    if (Math.round(Math.abs(duration)) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return "";
}
export {
  ApiError,
  cn,
  createMaskedError,
  createSlug,
  createUniqueSlug,
  deobfuscate,
  estimateReadingTime,
  extractResponseError,
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