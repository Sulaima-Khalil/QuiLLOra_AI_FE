import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * jsdom keeps one window per file, so storage written by one test would leak
 * into the next. Clearing both here keeps the auth and reset-flow suites —
 * which are entirely about what is and isn't persisted — independent.
 */
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
