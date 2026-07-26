import { Component } from "react";
import ErrorFallback from "./ErrorFallback";

/**
 * Top-level boundary so a render error shows a recovery screen instead of an
 * empty document.
 *
 * "Try again" clears the captured error and re-renders the subtree, which is
 * enough for transient failures (a bad API payload, a race on mount). If the
 * error repeats the boundary simply catches it again and the user still has
 * the Home and Dashboard escape hatches.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Console only — the screen stays generic so nothing internal leaks.
    console.error("[quillora] render error:", error, info?.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
