/** Map of short locale codes to full BCP 47 tags. */
const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
};

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const longFormatters = new Map<string, Intl.DateTimeFormat>();
const shortFormatters = new Map<string, Intl.DateTimeFormat>();

/** Resolve a short locale code to BCP 47 tag. */
export function resolveLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? locale;
}

/**
 * Parse date inputs safely, constructing YYYY-MM-DD as local midnight to prevent
 * negative-UTC timezone off-by-one shifts.
 */
export function parseDateSafely(input: string | number | Date): Date | null {
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

/**
 * Format a date string as a long date (e.g. "March 9, 2026" or "2026년 3월 9일").
 * Returns empty string for invalid date inputs instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
export function formatDate(dateStr: string | number | Date, locale = "en"): string {
  const date = parseDateSafely(dateStr);
  if (!date) return "";

  const resolved = resolveLocale(locale);
  let formatter = longFormatters.get(resolved);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(resolved, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    longFormatters.set(resolved, formatter);
  }
  return formatter.format(date);
}

/**
 * Format a date string as a short date (e.g. "03/09/2026" or "2026.03.09").
 * Returns empty string for invalid date inputs instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
export function formatDateShort(dateStr: string | number | Date, locale = "en"): string {
  const date = parseDateSafely(dateStr);
  if (!date) return "";

  const resolved = resolveLocale(locale);
  let formatter = shortFormatters.get(resolved);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(resolved, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    shortFormatters.set(resolved, formatter);
  }
  return formatter.format(date).replace(/\s/g, "");
}
