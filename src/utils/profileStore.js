import api, { unwrap } from "./apiClient";

/**
 * Profile and editorial settings, backed by the API.
 *
 * The store keeps an in-memory snapshot so `getProfile()` stays synchronous
 * for the components that read it during render, and notifies subscribers
 * whenever the server copy changes. `subscribeProfile` is unchanged, so
 * Home.jsx, Setting.jsx and Profile.jsx keep working as written.
 */

const EMPTY_PROFILE = {
  id: null,
  name: "",
  email: "",
  role: "",
  bio: "",
  country: "",
  avatar: "",
  initials: "",
  settings: {},
};

let snapshot = { ...EMPTY_PROFILE };
let loaded = false;

const CHANGE_EVENT = "quillora-profile-change";

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  return words.length === 1
    ? words[0][0].toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
};

/** Current cached profile. Synchronous; empty until the first fetch lands. */
export const getProfile = () => snapshot;

/** True once the server copy has been loaded at least once. */
export const isProfileLoaded = () => loaded;

/** Replaces the cache from a server payload (used by the auth flows). */
export const setProfile = (user) => {
  if (!user) return snapshot;

  snapshot = {
    ...EMPTY_PROFILE,
    ...user,
    initials: user.initials || getInitials(user.name),
  };
  loaded = true;
  emit();

  return snapshot;
};

/** Resets to the empty profile on sign-out. */
export const clearProfile = () => {
  snapshot = { ...EMPTY_PROFILE };
  loaded = false;
  emit();
};

/** Fetches the signed-in user's profile. */
export const fetchProfile = async () => {
  const data = unwrap(await api.get("/users/me"));
  return setProfile(data.profile);
};

/**
 * Persists a partial profile update.
 *
 * Keeps the name `saveProfile` and the "merge these fields" contract of the
 * localStorage version, so existing call sites are unchanged — but it is now
 * async and resolves once the server has accepted the change.
 */
export const saveProfile = async (partial) => {
  const data = unwrap(await api.patch("/users/me", partial));
  return setProfile(data.profile);
};

/** Uploads a new avatar image. */
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);

  const data = unwrap(
    await api.patch("/users/me", form, { headers: { "Content-Type": "multipart/form-data" } }),
  );

  return setProfile(data.profile);
};

/** Editorial preferences from the Settings page. */
export const getSettings = () => snapshot.settings ?? {};

export const fetchSettings = async () => {
  const data = unwrap(await api.get("/users/me/settings"));
  snapshot = { ...snapshot, settings: data.settings };
  emit();
  return data.settings;
};

/** Saves one or more settings; untouched toggles keep their values. */
export const saveSettings = async (partial) => {
  const data = unwrap(await api.patch("/users/me/settings", partial));
  snapshot = { ...snapshot, settings: data.settings };
  emit();
  return data.settings;
};

/** Public author profile with their published work and aggregate stats. */
export const fetchPublicProfile = async (identifier) =>
  unwrap(await api.get(`/users/${identifier}`));

/** Permanently deletes the account. */
export const deleteAccount = async (password) => {
  await api.delete("/users/me", { data: { password } });
  clearProfile();
};

export const subscribeProfile = (callback) => {
  const handler = () => callback(getProfile());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
