import { parseDateSafely, resolveLocale } from "./formatDate.js";

const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();

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
 * Returns empty string for invalid dates instead of throwing RangeError.
 * @param dateStr - ISO date string, YYYY-MM-DD, timestamp, or Date
 * @param locale - BCP 47 locale or short code ("en", "ko")
 * @param now - Current time in ms (defaults to Date.now(), injectable for testing)
 */
export function timeAgo(dateStr: string | number | Date, locale = "en", now?: number): string {
  const date = parseDateSafely(dateStr);
  if (!date) return "";

  const resolved = resolveLocale(locale);
  let rtf = relativeFormatters.get(resolved);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(resolved, { numeric: "auto" });
    relativeFormatters.set(resolved, rtf);
  }

  let duration = (date.getTime() - (now ?? Date.now())) / 1000;

  for (const division of DIVISIONS) {
    // Compare rounded magnitude so e.g. -59.6s rolls up to "-1 minute" instead of "-60 seconds"
    if (Math.round(Math.abs(duration)) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return "";
}
