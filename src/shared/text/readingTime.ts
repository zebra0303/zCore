import { stripMarkdown } from "./stripMarkdown.js";

/**
 * Estimate reading time based on content.
 * Korean: ~500 chars/min, English: ~200 words/min.
 * Returns minimum 1 minute.
 */
export function estimateReadingTime(text: string): number {
  if (!text) return 1;

  // Reuse stripMarkdown to accurately strip markdown/HTML constructs before counting
  const cleaned = stripMarkdown(text);

  // Count Korean characters accurately (Hangul syllables 가-힣 + compatibility jamo ㄱ-ㅎ, ㅏ-ㅣ)
  const koreanChars = (cleaned.match(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g) ?? []).length;

  // Count non-Korean words (English, numbers, etc.)
  const nonKorean = cleaned.replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, " ");
  const englishWords = nonKorean.split(/\s+/).filter(Boolean).length;

  const minutes = koreanChars / 500 + englishWords / 200;
  return Math.max(1, Math.round(minutes));
}
