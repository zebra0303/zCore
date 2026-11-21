/**
 * Regex-based Markdown stripper for generating plain text excerpts.
 * Removes HTML tags, code blocks, images, links, and common Markdown syntax.
 */
export function stripMarkdown(content: string): string {
  if (!content) return "";

  let text = content;

  // Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, "");

  // Remove HTML tags (repeatedly to handle nested/malformed tags)
  let prev: string;
  do {
    prev = text;
    text = text.replace(/<[^>]*>/g, "");
  } while (text !== prev);

  // Remove images (![alt](url)) -> keep alt text
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");

  // Remove links ([text](url)) -> keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove headers (# Header)
  text = text.replace(/^#{1,6}\s+/gm, "");

  // Remove blockquotes (> Quote)
  text = text.replace(/^>\s+/gm, "");

  // Remove GitHub alerts ([!NOTE], [!TIP], etc.)
  text = text.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, "");

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~(.*?)~~/g, "$1");

  // Remove bold/italic (**text**, __text__, *text*, _text_) without corrupting snake_case identifiers
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1");

  // Remove inline code (`code`)
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");

  // Remove list markers (- item, * item, + item, 1. item); avoid overlapping '-' class to prevent ReDoS
  text = text.replace(/^\s*[-+*]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Remove table rows (lines starting with |)
  text = text.replace(/^\s*\|.*$/gm, "");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ");

  return text.trim();
}
