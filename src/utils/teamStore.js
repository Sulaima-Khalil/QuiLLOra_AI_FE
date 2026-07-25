import api from "./apiClient";

/**
 * Workspace members, backed by the API.
 *
 * `getTeam()` stays synchronous and `subscribeTeam` is unchanged, so Team.jsx
 * and the team panel in Setting.jsx keep working — both already subscribe.
 */

const CHANGE_EVENT = "inkflow-team-change";

const ROLES = ["Admin", "Editor", "Viewer"];

let snapshot = [];
let loaded = false;
let inFlight = null;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

const setSnapshot = (members) => {
  snapshot = members;
  loaded = true;
  emit();
  return snapshot;
};

/** Cached member list. Empty until `refreshTeam()` resolves. */
export const getTeam = () => snapshot;

export const isTeamLoaded = () => loaded;

export const getRoles = () => ROLES;

export const refreshTeam = async () => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/team")
    .then((response) => setSnapshot(response.data.data?.members ?? []))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/**
 * Invites a member. Signature matches the previous store — the Team page
 * calls `inviteMember(name, email)` — and the backend derives a display name
 * from the address when one is not supplied.
 */
export const inviteMember = async (name, email, role) => {
  const address = email?.trim();
  if (!address) throw new Error("An email address is required to send an invite.");

  await api.post("/team", {
    ...(name?.trim() ? { name: name.trim() } : {}),
    email: address,
    ...(role ? { role } : {}),
  });

  return refreshTeam();
};

export const updateMemberRole = async (id, role) => {
  await api.patch(`/team/${id}/role`, { role });
  return refreshTeam();
};

export const removeMember = async (id) => {
  await api.delete(`/team/${id}`);
  return refreshTeam();
};

export const subscribeTeam = (callback) => {
  const handler = () => callback(getTeam());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
