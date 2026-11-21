// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { ConfirmModal } from "../ConfirmModal.js";

describe("ConfirmModal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    isOpen: true,
    title: "Delete Item",
    message: "Are you sure?",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders nothing when isOpen is false", () => {
    const { queryByRole } = render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(queryByRole("dialog")).toBeNull();
  });

  it("renders modal with accessible dialog attributes when isOpen is true", () => {
    const { getByRole, getByText } = render(<ConfirmModal {...defaultProps} />);
    const dialog = getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(getByText("Delete Item")).toBeTruthy();
    expect(getByText("Are you sure?")).toBeTruthy();
  });

  it("calls ONLY onConfirm when confirm button is clicked (not onCancel)", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const { getByText } = render(
      <ConfirmModal {...defaultProps} onConfirm={onConfirm} onCancel={onCancel} />,
    );

    fireEvent.click(getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel on Cancel click, backdrop click, and Escape key", () => {
    const onCancel = vi.fn();
    const { getByText, getByRole } = render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(3);
  });

  it("uses custom button labels and variant styles", () => {
    const { getByText, container } = render(
      <ConfirmModal {...defaultProps} confirmLabel="Yes" cancelLabel="No" variant="warning" />,
    );
    expect(getByText("Yes")).toBeTruthy();
    expect(getByText("No")).toBeTruthy();
    expect(document.body.innerHTML).toContain("text-amber-600");
    expect(container).toBeTruthy();
  });
});
