import React, { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback element or render function */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Optional error callback (e.g., logging/telemetry) */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Localized labels for the default fallback UI */
  title?: string;
  description?: string;
  retryLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable React Error Boundary for isolating rendering crashes across applications.
 * Uses semantic theme CSS variables so it adapts automatically to light/dark modes.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="bg-background text-foreground flex min-h-[240px] flex-col items-center justify-center p-6 text-center"
        >
          <div className="bg-card text-card-foreground border-border w-full max-w-md rounded-xl border p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">
              {this.props.title ?? "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {this.props.description ?? "An unexpected error occurred while rendering this page."}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
            >
              {this.props.retryLabel ?? "Try again"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
