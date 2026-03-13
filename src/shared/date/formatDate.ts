/** Map of short locale codes to full BCP 47 tags. */
const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
};

/** Resolve a short locale code to BCP 47 tag. */
function resolveLocale(locale: string): string {
  return LOCALE_MAP[locale] ?? locale;
}

/**
 * Format a date string as a long date (e.g. "March 9, 2026" or "2026년 3월 9일").
 * @param dateStr - ISO date string or YYYY-MM-DD
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
export function formatDate(dateStr: string, locale = "en"): string {
  const resolved = resolveLocale(locale);
  return new Intl.DateTimeFormat(resolved, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Format a date string as a short date (e.g. "03/09/2026" or "2026.03.09").
 * @param dateStr - ISO date string or YYYY-MM-DD
 * @param locale - BCP 47 locale or short code ("en", "ko")
 */
export function formatDateShort(dateStr: string, locale = "en"): string {
  const resolved = resolveLocale(locale);
  return new Intl.DateTimeFormat(resolved, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(dateStr))
    .replace(/\s/g, "");
}
