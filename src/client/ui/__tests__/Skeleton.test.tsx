import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Skeleton } from "../Skeleton.js";

describe("Skeleton", () => {
  it("renders a div with animate-pulse", () => {
    const html = renderToStaticMarkup(<Skeleton />);
    expect(html).toContain("animate-pulse");
    expect(html).toContain("rounded-lg");
  });

  it("merges custom className", () => {
    const html = renderToStaticMarkup(<Skeleton className="h-10 w-full" />);
    expect(html).toContain("animate-pulse");
    expect(html).toContain("h-10");
    expect(html).toContain("w-full");
  });

  it("passes through HTML attributes", () => {
    const html = renderToStaticMarkup(<Skeleton data-testid="loader" aria-label="Loading" />);
    expect(html).toContain('data-testid="loader"');
    expect(html).toContain('aria-label="Loading"');
  });
});
