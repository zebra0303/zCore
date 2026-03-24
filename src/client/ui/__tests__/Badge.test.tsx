import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge } from "../Badge.js";

describe("Badge", () => {
  it("renders a span element", () => {
    const html = renderToStaticMarkup(<Badge>New</Badge>);
    expect(html).toContain("<span");
    expect(html).toContain("New");
  });

  it("applies default variant classes", () => {
    const html = renderToStaticMarkup(<Badge>Tag</Badge>);
    expect(html).toContain("bg-primary");
  });

  it("applies secondary variant", () => {
    const html = renderToStaticMarkup(<Badge variant="secondary">Info</Badge>);
    expect(html).toContain("bg-secondary");
  });

  it("applies outline variant", () => {
    const html = renderToStaticMarkup(<Badge variant="outline">Draft</Badge>);
    expect(html).toContain("text-foreground");
  });

  it("applies destructive variant", () => {
    const html = renderToStaticMarkup(
      <Badge variant="destructive">Error</Badge>,
    );
    expect(html).toContain("bg-destructive");
  });

  it("merges custom className", () => {
    const html = renderToStaticMarkup(<Badge className="ml-2">X</Badge>);
    expect(html).toContain("ml-2");
  });
});
