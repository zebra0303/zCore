/**
 * Convert text to a URL-safe kebab-case slug.
 * Supports Korean Hangul characters (syllables, consonants, vowels).
 * @param text - The source text to slugify
 * @param fallback - Fallback slug when text produces empty result (default: "untitled")
 */
export function createSlug(text: string, fallback = "untitled"): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

/**
 * Create a unique slug by appending a numeric suffix if needed.
 * @param text - The source text to slugify
 * @param existingSlugs - Array of already-used slugs to check against
 * @param fallback - Fallback slug when text produces empty result (default: "untitled")
 */
export function createUniqueSlug(
  text: string,
  existingSlugs: string[],
  fallback = "untitled",
): string {
  const base = createSlug(text, fallback);
  if (!existingSlugs.includes(base)) return base;

  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
