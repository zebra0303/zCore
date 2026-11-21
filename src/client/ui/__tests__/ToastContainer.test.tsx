// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { ToastContainer } from "../ToastContainer.js";

describe("ToastContainer", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps aria-live region mounted even when there are no toasts", () => {
    const { container } = render(<ToastContainer toasts={[]} removeToast={vi.fn()} />);
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  it("assigns role=alert for error toasts and role=status for info/success/warning", () => {
    const removeToast = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ToastContainer
        toasts={[
          { id: "1", message: "Saved", type: "success" },
          { id: "2", message: "Careful", type: "warning" },
          { id: "3", message: "Failed", type: "error" },
        ]}
        removeToast={removeToast}
      />,
    );

    expect(getByRole("alert").textContent).toContain("Failed");
    expect(getAllByRole("status")).toHaveLength(2);

    const closeButtons = document.querySelectorAll('button[type="button"]');
    fireEvent.click(closeButtons[0]!);
    expect(removeToast).toHaveBeenCalledWith("1");
  });
});
