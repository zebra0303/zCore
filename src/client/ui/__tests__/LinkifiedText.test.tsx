import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LinkifiedText } from "../LinkifiedText.js";

describe("LinkifiedText", () => {
  it("returns null for empty text", () => {
    const html = renderToStaticMarkup(<LinkifiedText text="" />);
    expect(html).toBe("");
  });

  it("renders plain text without links", () => {
    const html = renderToStaticMarkup(<LinkifiedText text="Hello world" />);
    expect(html).toBe("Hello world");
  });

  it("renders a URL as a clickable link", () => {
    const html = renderToStaticMarkup(<LinkifiedText text="Visit https://example.com please" />);
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Visit ");
    expect(html).toContain(" please");
  });

  it("renders multiple links", () => {
    const html = renderToStaticMarkup(
      <LinkifiedText text="Go to https://a.com and https://b.com" />,
    );
    expect(html).toContain('href="https://a.com"');
    expect(html).toContain('href="https://b.com"');
  });

  it("applies custom linkClassName", () => {
    const html = renderToStaticMarkup(
      <LinkifiedText text="https://example.com" linkClassName="custom-link" />,
    );
    expect(html).toContain("custom-link");
  });

  it("renders text-only content without anchor tags", () => {
    const html = renderToStaticMarkup(<LinkifiedText text="No links here at all" />);
    expect(html).not.toContain("<a ");
    expect(html).toBe("No links here at all");
  });
});
