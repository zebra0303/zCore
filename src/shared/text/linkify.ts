/** Regex for detecting http/https URLs in text. */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/** A segment of text that is either plain text or a URL. */
export interface LinkSegment {
  text: string;
  isUrl: boolean;
}

/**
 * Parse text into segments, identifying URLs.
 * Pure function with no DOM dependency — UI rendering is left to the consumer.
 *
 * @example
 * parseLinkSegments("Visit https://example.com now")
 * // [{ text: "Visit ", isUrl: false }, { text: "https://example.com", isUrl: true }, { text: " now", isUrl: false }]
 */
export function parseLinkSegments(text: string): LinkSegment[] {
  if (!text) return [];

  const parts = text.split(URL_REGEX);
  const segments: LinkSegment[] = [];

  for (const part of parts) {
    if (!part) continue;
    segments.push({ text: part, isUrl: URL_REGEX.test(part) });
    // Reset lastIndex since regex has global flag
    URL_REGEX.lastIndex = 0;
  }

  return segments;
}
