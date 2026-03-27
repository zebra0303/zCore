import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LazyImage } from "../LazyImage.js";

describe("LazyImage", () => {
  it("renders a container div", () => {
    const html = renderToStaticMarkup(<LazyImage src="test.jpg" alt="test" />);
    expect(html).toContain("<div");
  });

  it("renders the img immediately if priority is true", () => {
    const html = renderToStaticMarkup(<LazyImage src="test.jpg" alt="test" priority />);
    expect(html).toContain("<img");
    expect(html).toContain('src="test.jpg"');
    expect(html).toContain('loading="eager"');
  });

  it("does not render the img immediately if priority is false (waiting for observer)", () => {
    const html = renderToStaticMarkup(<LazyImage src="test.jpg" alt="test" />);
    expect(html).not.toContain("<img");
  });

  it("applies objectFit classes", () => {
    const html = renderToStaticMarkup(
      <LazyImage src="test.jpg" alt="test" priority objectFit="contain" />,
    );
    expect(html).toContain("object-contain");
  });
});
