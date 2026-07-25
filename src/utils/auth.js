import api, { clearSessionFlag, errorMessage, hasSessionFlag, setSessionFlag, unwrap } from "./apiClient";
import { setProfile, clearProfile } from "./profileStore";

/**
 * Authentication against the InkFlow AI backend.
 *
 * Exported names and call signatures are unchanged from the localStorage
 * build, so Login.jsx, Register.jsx and the route guards need no edits. The
 * pages read `err.response.data.message`, which the backend already provides.
 */

/** Seeded demo account — created by the backend's `npm run seed`. */
export const DEMO_CREDENTIALS = { email: "alex@inkflow.ai", password: "demo1234" };

/** Normalises an axios failure into the `{ response: { data: { message } } }`
 *  shape the auth pages already destructure. */
const toFormError = (error, fallback) => {
  if (error?.response?.data?.message) return error;
  return { response: { data: { message: errorMessage(error, fallback) } } };
};

// Register
export const registerUser = async ({ name, email, password, username, country, newsletter }) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      // Omitted rather than sent empty: the backend treats "" as invalid.
      ...(username ? { username } : {}),
      ...(country ? { country } : {}),
      ...(newsletter !== undefined ? { newsletter } : {}),
    });

    const data = unwrap(response);
    setSessionFlag(data.user);
    setProfile(data.user);

    return { token: data.accessToken, user: data.user };
  } catch (error) {
    throw toFormError(error, "Could not create your account. Please try again.");
  }
};

// Login
export const loginUser = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    const data = unwrap(response);
    setSessionFlag(data.user);
    setProfile(data.user);

    return { token: data.accessToken, user: data.user };
  } catch (error) {
    throw toFormError(error, "Invalid email or password.");
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout", {});
  } catch {
    // A failed call must not trap the user in a signed-in UI; the local
    // session is cleared either way and the cookie expires server-side.
  } finally {
    clearSessionFlag();
    clearProfile();
  }
};

/**
 * Synchronous best-effort check used by ProtectedRoute and GuestRoute.
 * Reads the local session hint; the server re-validates on every request.
 */
export const isAuthenticated = () => hasSessionFlag();

/**
 * Confirms the session against the server and refreshes the cached profile.
 * Call once on app start to restore state after a reload.
 */
export const restoreSession = async () => {
  if (!hasSessionFlag()) return null;

  try {
    const data = unwrap(await api.get("/auth/me"));
    setSessionFlag(data.user);
    setProfile(data.user);
    return data.user;
  } catch {
    clearSessionFlag();
    clearProfile();
    return null;
  }
};

/** Starts the password-reset flow: emails a 6-digit code (and a link). */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw toFormError(error, "Could not send the reset code. Please try again.");
  }
};

/**
 * Checks the 6-digit code before the user picks a new password.
 *
 * Backends that only validate the code when the password is submitted have no
 * such route; a missing endpoint resolves as `{ verified: false, deferred:
 * true }` so the flow continues and the reset step reports a bad code instead.
 */
export const verifyResetCode = async ({ email, code }) => {
  try {
    const response = await api.post("/auth/verify-reset-code", { email, code });
    return { verified: true, ...(response.data || {}) };
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404 || status === 405 || status === 501) {
      return { verified: false, deferred: true };
    }
    throw toFormError(error, "That code is incorrect or has expired.");
  }
};

/**
 * Completes a password reset.
 *
 * Accepts either the `token` from the emailed link or the `code` typed on the
 * verify screen. The code is also sent as `token` because the backend treats
 * the emailed value as the reset token regardless of how the user supplied it.
 */
export const resetPassword = async ({ token, code, email, password }) => {
  try {
    const payload = token
      ? { token, password }
      : { token: code, code, email, password };
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  } catch (error) {
    throw toFormError(error, "This reset code is invalid or has expired.");
  }
};

/** Confirms an email address with the token from the verification link. */
export const verifyEmail = async (token) => {
  try {
    const data = unwrap(await api.post("/auth/verify-email", { token }));
    if (data?.user) setProfile(data.user);
    return data;
  } catch (error) {
    throw toFormError(error, "This verification link is invalid or has expired.");
  }
};

/** Re-sends the verification email. */
export const resendVerification = async (email) => {
  try {
    const response = await api.post("/auth/resend-verification", { email });
    return response.data;
  } catch (error) {
    throw toFormError(error, "Could not resend the verification email.");
  }
};

/** Changes the password of the signed-in user. */
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await api.post("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw toFormError(error, "Could not update your password.");
  }
};

/** Active sessions, for the Security panel on the Settings page. */
export const listSessions = async () => {
  const data = unwrap(await api.get("/auth/sessions"));
  return data?.sessions ?? [];
};

/** OAuth providers the backend has credentials for. */
export const getAuthProviders = async () => {
  try {
    const data = unwrap(await api.get("/oauth/providers"));
    return data?.providers ?? [];
  } catch {
    return [];
  }
};

/** Sends the browser to the provider's consent screen. */
export const startOAuth = (provider) => {
  const base = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
  window.location.href = `${base}/api/v1/oauth/${provider}`;
};
