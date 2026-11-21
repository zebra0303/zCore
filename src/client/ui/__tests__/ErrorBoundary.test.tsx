// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary.js";

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Render crash");
  }
  return <div>Healthy content</div>;
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children normally when no error occurs", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(getByText("Healthy content")).toBeTruthy();
  });

  it("catches errors, invokes onError, and resets on retry", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    let shouldThrow = true;

    function DynamicChild() {
      return <ThrowingChild shouldThrow={shouldThrow} />;
    }

    const { getByRole, getByText } = render(
      <ErrorBoundary onError={onError} title="Error Title" retryLabel="Retry">
        <DynamicChild />
      </ErrorBoundary>,
    );

    expect(getByRole("alert").textContent).toContain("Error Title");
    expect(onError).toHaveBeenCalledTimes(1);

    shouldThrow = false;
    fireEvent.click(getByText("Retry"));
    expect(getByText("Healthy content")).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
