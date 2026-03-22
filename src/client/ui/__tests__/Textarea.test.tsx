import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Textarea } from "../Textarea.js";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    const html = renderToStaticMarkup(<Textarea />);
    expect(html).toContain("<textarea");
    expect(html).toContain("rounded");
  });

  it("forwards placeholder attribute", () => {
    const html = renderToStaticMarkup(<Textarea placeholder="Write here" />);
    expect(html).toContain('placeholder="Write here"');
  });

  it("forwards rows attribute", () => {
    const html = renderToStaticMarkup(<Textarea rows={5} />);
    expect(html).toContain('rows="5"');
  });

  it("forwards disabled attribute", () => {
    const html = renderToStaticMarkup(<Textarea disabled />);
    expect(html).toContain("disabled");
  });

  it("merges custom className", () => {
    const html = renderToStaticMarkup(<Textarea className="h-40" />);
    expect(html).toContain("h-40");
  });
});
