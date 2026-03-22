import { formatDate } from "./formatDate.js";

/** Map of short locale codes to full BCP 47 tags. */
const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  ko: "ko-KR",
};

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

/**
 * Format a date as a relative time string (e.g. "3 hours ago", "2일 전").
 * Falls back to absolute date for very old dates.
 * @param dateStr - ISO date string or YYYY-MM-DD
 * @param locale - BCP 47 locale or short code ("en", "ko")
 * @param now - Current time in ms (defaults to Date.now(), injectable for testing)
 */
export function timeAgo(dateStr: string, locale = "en", now?: number): string {
  const resolved = LOCALE_MAP[locale] ?? locale;
  const rtf = new Intl.RelativeTimeFormat(resolved, { numeric: "auto" });
  const date = new Date(dateStr);
  let duration = (date.getTime() - (now ?? Date.now())) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return formatDate(dateStr, locale);
}
