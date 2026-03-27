import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Checkbox } from "../Checkbox.js";

describe("Checkbox", () => {
  it("renders a checkbox input", () => {
    const html = renderToStaticMarkup(<Checkbox />);
    expect(html).toContain('type="checkbox"');
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(<Checkbox className="custom-class" />);
    expect(html).toContain("custom-class");
  });

  it("forwards attributes to the input", () => {
    const html = renderToStaticMarkup(<Checkbox name="test-checkbox" checked readOnly />);
    expect(html).toContain('name="test-checkbox"');
    expect(html).toContain("checked");
  });
});
