import { useEffect } from "react";
import { useLocation, useNavigate, useRouteError } from "react-router-dom";
import ErrorFallback from "./ErrorFallback";

/**
 * Error element for the data router.
 *
 * A render error inside a route never reaches a boundary placed above
 * <RouterProvider> — the router catches it first and, with no errorElement of
 * our own, falls back to its built-in developer screen, which prints the error
 * message and full stack trace onto the page. This replaces that with the
 * app's recovery screen and keeps the details in the console.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("[quillora] route error:", error);
  }, [error]);

  // Navigating clears the router's error state, so re-entering the same URL
  // remounts the route without discarding the loaded bundle.
  const retry = () => navigate(location.pathname + location.search, { replace: true });

  return <ErrorFallback onRetry={retry} />;
}
