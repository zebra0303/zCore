/** Non-global candidate matcher for http/https URLs in text. */
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/;
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:'")\]}>]+$/;

/** Validate that a candidate string is a well-formed http/https URL. */
function isValidHttpUrl(candidate: string): boolean {
  try {
    const parsed = new URL(candidate);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

/** Trim trailing sentence punctuation while preserving balanced parentheses in URLs. */
function trimTrailingPunctuation(raw: string): { url: string; trailing: string } {
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

  // Split with capturing group: odd indices are candidate URLs (avoids stateful global regex)
  const parts = text.split(URL_SPLIT_REGEX);
  const segments: LinkSegment[] = [];

  const pushPlain = (plain: string) => {
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
