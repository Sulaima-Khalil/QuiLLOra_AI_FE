import axios from "axios";

/**
 * Single axios instance for the InkFlow AI backend.
 *
 * Auth travels in HTTP-only cookies, so `withCredentials` is mandatory and
 * the browser attaches the session automatically — there is no token for
 * application code to read, store, or accidentally leak.
 */
const baseURL = `${(import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "")}/api/v1`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/**
 * Unwraps the backend's `{ success, message, data }` envelope so callers
 * receive the payload directly.
 */
export const unwrap = (response) => response?.data?.data ?? null;

/** Pulls a human-readable message out of any axios failure. */
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.message || error?.message || fallback;

/* ---------------------------------------------------------------------------
 * Transparent access-token refresh
 *
 * The access token is short-lived. When a call returns 401, the interceptor
 * refreshes once and replays the original request, so an expired token is
 * invisible to the UI. Concurrent 401s share a single refresh promise rather
 * than stampeding the endpoint.
 * ------------------------------------------------------------------------ */

let refreshPromise = null;

/** Endpoints where a 401 is the answer, not a recoverable session problem. */
const NO_RETRY = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

const onSessionLost = () => {
  clearSessionFlag();
  // Let the app react (route guards, banners) without a hard reload.
  window.dispatchEvent(new Event("inkflow-session-expired"));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retried) return Promise.reject(error);
    if (NO_RETRY.some((path) => original.url?.startsWith(path))) return Promise.reject(error);

    original._retried = true;

    try {
      refreshPromise = refreshPromise ?? api.post("/auth/refresh", {});
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      onSessionLost();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

/* ---------------------------------------------------------------------------
 * Session flag
 *
 * The auth cookie is HTTP-only and therefore unreadable from JavaScript, but
 * the route guards need a synchronous answer to "is someone signed in?".
 * This flag is that answer: a hint maintained alongside the real session,
 * never a credential. The server remains the only authority.
 * ------------------------------------------------------------------------ */

const SESSION_KEY = "inkflow_session";

export const setSessionFlag = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user?.id, name: user?.name, at: Date.now() }));
  } catch {
    // Storage unavailable (private mode, quota) — the app still works, the
    // guards just fall back to a server round-trip.
  }
};

export function clearSessionFlag() {
  try {
    localStorage.removeItem(SESSION_KEY);
    // Legacy keys from the localStorage-only build.
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
  } catch {
    // Ignore.
  }
}

export const hasSessionFlag = () => {
  try {
    return Boolean(localStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
};

export default api;
