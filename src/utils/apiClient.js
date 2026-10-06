import axios from "axios";

/**
 * Single axios instance for the QuiLLora AI backend.
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

/**
 * Pulls a human-readable message out of any axios failure.
 *
 * Only 4xx messages are repeated to the user. Those are written for the person
 * reading them ("Invalid email or password."); a 5xx message is an internal —
 * a driver failure, a stack, a file path from the server's build machine — and
 * the backend only discloses it at all because it is running outside
 * production. A TLS handshake failure once reached the login form as
 * "error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error…".
 *
 * Axios's own `error.message` is skipped for the same reason: "Network Error"
 * and "timeout of 20000ms exceeded" are diagnostics, not sentences.
 */
export const errorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (status >= 400 && status < 500 && serverMessage) return serverMessage;

  // No response at all: the request never completed.
  if (!error?.response) {
    return error?.code === "ECONNABORTED"
      ? "That took too long. Check your connection and try again."
      : "Can't reach the server. Check your connection and try again.";
  }

  return fallback;
};

/**
 * Whether a failure is the server refusing an action on plan grounds.
 *
 * The backend returns 403 with `code: "PLAN_LIMIT_REACHED"`. Matching on the
 * code rather than the status keeps this distinct from an ownership refusal,
 * which is also a 403 but means something entirely different.
 */
export const isPlanLimitError = (error) =>
  error?.response?.status === 403 && error?.response?.data?.code === "PLAN_LIMIT_REACHED";

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
  window.dispatchEvent(new Event("quillora-session-expired"));
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

const SESSION_KEY = "quillora_session";

export const setSessionFlag = (user, rememberMe = true) => {
  const value = JSON.stringify({ id: user?.id, name: user?.name, at: Date.now() });
  try {
    (rememberMe ? localStorage : sessionStorage).setItem(SESSION_KEY, value);
  } catch {
    // Storage unavailable (private mode, quota) — the app still works, the
    // guards just fall back to a server round-trip.
  }
  try {
    (rememberMe ? sessionStorage : localStorage).removeItem(SESSION_KEY);
  } catch {
    // Ignore unavailable secondary storage.
  }
};

export const hasPersistentSessionFlag = () => {
  try {
    return Boolean(localStorage.getItem(SESSION_KEY));
  } catch {
    return false;
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
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore.
  }
}

export const hasSessionFlag = () => {
  try {
    return Boolean(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY));
  } catch {
    try {
      return Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch {
      return false;
    }
  }
};

export default api;
