import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfirmModal } from "../ConfirmModal.js";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    title: "Delete Item",
    message: "Are you sure?",
    onConfirm: () => {},
    onCancel: () => {},
  };

  it("renders nothing when isOpen is false", () => {
    const html = renderToStaticMarkup(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(html).toBe("");
  });

  it("renders modal when isOpen is true", () => {
    const html = renderToStaticMarkup(<ConfirmModal {...defaultProps} />);
    expect(html).toContain("Delete Item");
    expect(html).toContain("Are you sure?");
  });

  it("has role=dialog and aria-modal", () => {
    const html = renderToStaticMarkup(<ConfirmModal {...defaultProps} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
  });

  it("renders confirm and cancel buttons", () => {
    const html = renderToStaticMarkup(<ConfirmModal {...defaultProps} />);
    expect(html).toContain("Confirm");
    expect(html).toContain("Cancel");
  });

  it("uses custom button labels", () => {
    const html = renderToStaticMarkup(
      <ConfirmModal {...defaultProps} confirmLabel="Yes" cancelLabel="No" />,
    );
    expect(html).toContain("Yes");
    expect(html).toContain("No");
  });

  it("applies variant styles", () => {
    const html = renderToStaticMarkup(<ConfirmModal {...defaultProps} variant="warning" />);
    expect(html).toContain("text-amber-600");
  });
});
