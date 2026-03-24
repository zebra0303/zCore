import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../Button.js";

describe("Button", () => {
  it("renders a button element", () => {
    const html = renderToStaticMarkup(<Button>Click</Button>);
    expect(html).toContain("<button");
    expect(html).toContain("Click");
  });

  it("applies default variant classes", () => {
    const html = renderToStaticMarkup(<Button>OK</Button>);
    expect(html).toContain("bg-primary");
  });

  it("applies destructive variant", () => {
    const html = renderToStaticMarkup(
      <Button variant="destructive">Delete</Button>,
    );
    expect(html).toContain("bg-destructive");
  });

  it("maps danger to destructive", () => {
    const html = renderToStaticMarkup(<Button variant="danger">Remove</Button>);
    expect(html).toContain("bg-destructive");
  });

  it("applies size classes", () => {
    const html = renderToStaticMarkup(<Button size="lg">Big</Button>);
    expect(html).toContain("h-11");
    expect(html).toContain("px-8");
  });

  it("forwards disabled attribute", () => {
    const html = renderToStaticMarkup(<Button disabled>No</Button>);
    expect(html).toContain("disabled");
  });

  it("merges custom className", () => {
    const html = renderToStaticMarkup(<Button className="mt-4">X</Button>);
    expect(html).toContain("mt-4");
  });
});
