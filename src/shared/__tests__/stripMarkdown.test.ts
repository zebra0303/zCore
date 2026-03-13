import { describe, it, expect } from "vitest";
import { stripMarkdown } from "../text/stripMarkdown.js";

describe("stripMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
    expect(stripMarkdown(null as unknown as string)).toBe("");
  });

  it("removes code blocks", () => {
    expect(stripMarkdown("before ```const x = 1;``` after")).toBe(
      "before after",
    );
  });

  it("removes multiline code blocks", () => {
    const input = "text\n```js\nconst x = 1;\nconst y = 2;\n```\nmore text";
    expect(stripMarkdown(input)).toBe("text more text");
  });

  it("removes HTML tags", () => {
    expect(stripMarkdown("<b>bold</b> and <i>italic</i>")).toBe(
      "bold and italic",
    );
  });

  it("removes nested HTML tags", () => {
    expect(stripMarkdown("<div><span>nested</span></div>")).toBe("nested");
  });

  it("preserves alt text from images", () => {
    expect(stripMarkdown("![alt text](https://example.com/img.png)")).toBe(
      "alt text",
    );
  });

  it("preserves link text", () => {
    expect(stripMarkdown("[click here](https://example.com)")).toBe(
      "click here",
    );
  });

  it("removes headers", () => {
    expect(stripMarkdown("# Title\n## Subtitle\nBody")).toBe(
      "Title Subtitle Body",
    );
  });

  it("removes blockquotes", () => {
    expect(stripMarkdown("> quoted text")).toBe("quoted text");
  });

  it("removes GitHub alerts", () => {
    expect(stripMarkdown("[!NOTE] important info")).toBe("important info");
    expect(stripMarkdown("[!WARNING] be careful")).toBe("be careful");
  });

  it("removes bold and italic", () => {
    expect(stripMarkdown("**bold** and *italic*")).toBe("bold and italic");
    expect(stripMarkdown("__bold__ and _italic_")).toBe("bold and italic");
  });

  it("removes inline code", () => {
    expect(stripMarkdown("use `console.log()` here")).toBe(
      "use console.log() here",
    );
  });

  it("removes horizontal rules", () => {
    expect(stripMarkdown("above\n---\nbelow")).toBe("above below");
    expect(stripMarkdown("above\n***\nbelow")).toBe("above below");
  });

  it("removes list markers", () => {
    expect(stripMarkdown("- item one\n- item two")).toBe("item one item two");
    expect(stripMarkdown("1. first\n2. second")).toBe("first second");
  });

  it("removes table rows", () => {
    expect(stripMarkdown("| Col1 | Col2 |\n| --- | --- |\n| A | B |")).toBe(
      "",
    );
  });

  it("normalizes whitespace", () => {
    expect(stripMarkdown("too   many   spaces\n\n\nnewlines")).toBe(
      "too many spaces newlines",
    );
  });

  it("handles complex mixed markdown", () => {
    const input = `# Hello World

This is **bold** and *italic* with [a link](https://example.com).

\`\`\`js
const x = 1;
\`\`\`

> A blockquote

- List item`;
    const result = stripMarkdown(input);
    expect(result).toContain("Hello World");
    expect(result).toContain("bold");
    expect(result).toContain("a link");
    expect(result).not.toContain("```");
    expect(result).not.toContain("**");
    expect(result).not.toContain("const x");
  });
});
