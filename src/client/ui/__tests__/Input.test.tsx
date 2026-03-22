import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "../Input.js";

describe("Input", () => {
  it("renders an input element", () => {
    const html = renderToStaticMarkup(<Input />);
    expect(html).toContain("<input");
    expect(html).toContain("rounded");
  });

  it("forwards placeholder attribute", () => {
    const html = renderToStaticMarkup(<Input placeholder="Enter text" />);
    expect(html).toContain('placeholder="Enter text"');
  });

  it("forwards type attribute", () => {
    const html = renderToStaticMarkup(<Input type="password" />);
    expect(html).toContain('type="password"');
  });

  it("forwards disabled attribute", () => {
    const html = renderToStaticMarkup(<Input disabled />);
    expect(html).toContain("disabled");
  });

  it("merges custom className", () => {
    const html = renderToStaticMarkup(<Input className="w-64" />);
    expect(html).toContain("w-64");
  });
});
