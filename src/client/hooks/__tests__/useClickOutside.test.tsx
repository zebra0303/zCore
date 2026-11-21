// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { useRef } from "react";
import { useClickOutside } from "../useClickOutside.js";

function TestHarness({ onOutside, enabled = true }: { onOutside: () => void; enabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onOutside, enabled);
  return (
    <div>
      <div ref={ref} data-testid="inside">
        Inside
      </div>
      <button type="button" data-testid="outside">
        Outside
      </button>
    </div>
  );
}

describe("useClickOutside", () => {
  afterEach(() => {
    cleanup();
  });

  it("calls handler on pointerdown outside referenced element", () => {
    const handler = vi.fn();
    const { getByTestId } = render(<TestHarness onOutside={handler} />);

    fireEvent.pointerDown(getByTestId("inside"));
    expect(handler).not.toHaveBeenCalled();

    fireEvent.pointerDown(getByTestId("outside"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not attach listener when enabled is false", () => {
    const handler = vi.fn();
    const { getByTestId } = render(<TestHarness onOutside={handler} enabled={false} />);

    fireEvent.pointerDown(getByTestId("outside"));
    expect(handler).not.toHaveBeenCalled();
  });
});
