/**
 * Keeps the address being recovered across the password-reset screens.
 *
 * The steps hand it over as router state, which a hard refresh throws away —
 * sessionStorage means reloading step 2 or 3 continues the flow instead of
 * bouncing back to step 1. Tab-scoped and cleared once the reset completes.
 *
 * The 6-digit code is deliberately NOT stored: refreshing the password step
 * asks for it again rather than leaving a live credential lying around.
 */
const KEY = "quillora_reset_email";

export const rememberResetEmail = (email) => {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    // Private-mode or storage-disabled browsers just lose refresh resilience.
  }
};

export const getResetEmail = () => {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};

export const forgetResetEmail = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up.
  }
};
