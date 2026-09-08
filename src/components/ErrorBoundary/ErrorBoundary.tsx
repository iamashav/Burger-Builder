import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * The one place a class component is still required: React exposes no hook equivalent
 * of componentDidCatch.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error in render tree', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-2xl tracking-wide">Something broke</h1>
        <p className="mt-2 text-smoke">
          Sorry — that is on us. Reloading the page usually clears it.
        </p>
      </div>
    );
  }
}
