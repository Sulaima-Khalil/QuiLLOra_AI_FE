import api, { unwrap } from "./apiClient";

/**
 * What the caller's plan allows, as the server reports it.
 *
 * Used for UX only — to explain a limit before someone hits it, and to point
 * at the upgrade page. The server refuses over-limit writes on its own; if
 * this cache were stale, wrong, or edited in devtools, the write would still
 * be rejected. Nothing here is a security boundary.
 */

const CHANGE_EVENT = "quillora-entitlements-change";

let snapshot = null;
let inFlight = null;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

export const getEntitlements = () => snapshot;

export const areEntitlementsLoaded = () => snapshot !== null;

/** Loads entitlements. Concurrent callers share one request. */
export const fetchEntitlements = async () => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/billing/entitlements")
    .then((response) => {
      snapshot = unwrap(response)?.entitlements ?? null;
      emit();
      return snapshot;
    })
    .catch(() => {
      // Signed out or unreachable. Stay silent: the UI simply shows no
      // proactive hint, and the server still enforces on write.
      snapshot = null;
      emit();
      return null;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/**
 * One capability's state, or null when unknown.
 * @returns {{limit: number|null, usage: number|null, remaining: number|null,
 *   enforced: boolean, reached: boolean} | null}
 */
export const capability = (name) => snapshot?.capabilities?.[name] ?? null;

/** True only when the server both enforces the limit and reports it full. */
export const isLimitReached = (name) => Boolean(capability(name)?.reached);

export const subscribeEntitlements = (callback) => {
  const handler = () => callback(getEntitlements());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};

/** Test seam, and called on sign-out. */
export const resetEntitlements = () => {
  snapshot = null;
  inFlight = null;
  emit();
};
