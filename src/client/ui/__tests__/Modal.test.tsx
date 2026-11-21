// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { StrictMode } from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Modal } from "../Modal.js";

describe("Modal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when closed", () => {
    const { queryByRole } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        Body
      </Modal>,
    );
    expect(queryByRole("dialog")).toBeNull();
  });

  it("mounts safely under StrictMode without calling showModal twice on open dialog", () => {
    const showModalSpy = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    const closeSpy = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
    HTMLDialogElement.prototype.showModal = showModalSpy;
    HTMLDialogElement.prototype.close = closeSpy;

    const onClose = vi.fn();
    const { getByText } = render(
      <StrictMode>
        <Modal isOpen={true} onClose={onClose} title="Strict Modal">
          <p>Inner content</p>
        </Modal>
      </StrictMode>,
    );

    expect(getByText("Strict Modal")).toBeTruthy();
    expect(getByText("Inner content")).toBeTruthy();

    // Clicking inside inner content should NOT trigger backdrop onClose
    fireEvent.click(getByText("Inner content"));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking close button triggers onClose
    fireEvent.click(getByText("Close").closest("button")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
