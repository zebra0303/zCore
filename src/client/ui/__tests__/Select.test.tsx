import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "../Select.js";

describe("Select", () => {
  it("renders a select element with children", () => {
    const html = renderToStaticMarkup(
      <Select>
        <option value="1">Option 1</option>
      </Select>,
    );
    expect(html).toContain("<select");
    expect(html).toContain("Option 1");
  });

  it("renders a chevron icon", () => {
    const html = renderToStaticMarkup(<Select />);
    expect(html).toContain("<svg"); // ChevronDown
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(<Select className="custom-select" />);
    expect(html).toContain("custom-select");
  });
});
