import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ToggleSwitch } from "../ToggleSwitch.js";

describe("ToggleSwitch", () => {
  it("renders a switch button", () => {
    const html = renderToStaticMarkup(<ToggleSwitch checked={false} onToggle={() => {}} />);
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="false"');
  });

  it("reflects checked state in aria-checked", () => {
    const html = renderToStaticMarkup(<ToggleSwitch checked={true} onToggle={() => {}} />);
    expect(html).toContain('aria-checked="true"');
  });

  it("applies size classes", () => {
    const htmlMd = renderToStaticMarkup(
      <ToggleSwitch checked={false} onToggle={() => {}} size="md" />,
    );
    const htmlSm = renderToStaticMarkup(
      <ToggleSwitch checked={false} onToggle={() => {}} size="sm" />,
    );
    expect(htmlMd).toContain("h-6");
    expect(htmlSm).toContain("h-5");
  });

  it("applies label as aria-label", () => {
    const html = renderToStaticMarkup(
      <ToggleSwitch checked={false} onToggle={() => {}} label="Enable" />,
    );
    expect(html).toContain('aria-label="Enable"');
  });
});
