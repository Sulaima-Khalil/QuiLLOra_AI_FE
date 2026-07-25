import api, { unwrap } from "./apiClient";

/**
 * Saved articles and reading lists, backed by the API.
 *
 * `getState()` stays synchronous and `subscribeCollections` is unchanged, so
 * Collections.jsx and Discover.jsx work as written — they already subscribe,
 * which is what lets the cache hydrate after the first render.
 */

const CHANGE_EVENT = "quillora-collections-change";

const EMPTY_STATE = { bookmarks: [], collections: [], articlesById: {} };

let snapshot = { ...EMPTY_STATE };
let loaded = false;
let inFlight = null;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

const setSnapshot = (next) => {
  snapshot = {
    bookmarks: next.bookmarks ?? [],
    collections: next.collections ?? [],
    // Retained so components written against the old store shape keep working.
    articlesById: snapshot.articlesById,
  };
  loaded = true;
  emit();
  return snapshot;
};

/** Cached state. Empty until `refreshCollections()` resolves. */
export const getState = () => snapshot;

export const areCollectionsLoaded = () => loaded;

/** Loads bookmarks and collections in a single request. */
export const refreshCollections = async () => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/collections/state")
    .then((response) => setSnapshot(response.data.data ?? EMPTY_STATE))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

export const isBookmarked = (articleId) => snapshot.bookmarks.includes(articleId);

/**
 * Toggles a bookmark.
 *
 * Accepts the whole article object, as the previous store did, so the
 * Discover and Collections call sites are unchanged.
 */
export const toggleBookmark = async (article) => {
  const articleId = typeof article === "string" ? article : article?.id;
  if (!articleId) return snapshot;

  // Optimistic flip: the bookmark icon responds immediately, and the
  // authoritative state from the response replaces it a moment later.
  const wasBookmarked = snapshot.bookmarks.includes(articleId);
  setSnapshot({
    ...snapshot,
    bookmarks: wasBookmarked
      ? snapshot.bookmarks.filter((id) => id !== articleId)
      : [...snapshot.bookmarks, articleId],
  });

  if (typeof article === "object" && article) {
    snapshot.articlesById = { ...snapshot.articlesById, [articleId]: article };
  }

  try {
    const data = unwrap(await api.post("/collections/bookmarks", { articleId }));
    return setSnapshot(data);
  } catch (error) {
    // Roll the optimistic change back so the UI never lies about what was saved.
    await refreshCollections();
    throw error;
  }
};

/** Saved articles, hydrated from the server. */
export const fetchSavedArticles = async () => {
  const data = unwrap(await api.get("/collections/bookmarks"));
  return data.articles ?? [];
};

/**
 * Saved articles resolved from a caller-supplied lookup list.
 * Kept synchronous for the components that pass in their own article list.
 */
export const getSavedArticles = (articlesLookup = []) => {
  const knownById = { ...snapshot.articlesById };
  articlesLookup.forEach((article) => {
    knownById[article.id] = article;
  });

  return snapshot.bookmarks.map((id) => knownById[id]).filter(Boolean);
};

/* ---------------------------------------------------------------------------
 * Collections
 * ------------------------------------------------------------------------ */

export const createCollection = async (name) => {
  await api.post("/collections", { name });
  return refreshCollections();
};

export const renameCollection = async (id, name) => {
  await api.patch(`/collections/${id}`, { name });
  return refreshCollections();
};

export const deleteCollection = async (id) => {
  await api.delete(`/collections/${id}`);
  return refreshCollections();
};

export const addToCollection = async (collectionId, article) => {
  const articleId = typeof article === "string" ? article : article?.id;
  if (!articleId) return snapshot;

  if (typeof article === "object" && article) {
    snapshot.articlesById = { ...snapshot.articlesById, [articleId]: article };
  }

  await api.post(`/collections/${collectionId}/articles`, { articleId });
  return refreshCollections();
};

export const removeFromCollection = async (collectionId, articleId) => {
  await api.delete(`/collections/${collectionId}/articles/${articleId}`);
  return refreshCollections();
};

/** Articles inside one collection, fetched with their full details. */
export const fetchCollectionArticles = async (collectionId) => {
  const data = unwrap(await api.get(`/collections/${collectionId}`));
  return data.collection?.articles ?? [];
};

/**
 * Synchronous resolution of a collection's articles from a lookup list,
 * matching the previous store's signature.
 */
export const getCollectionArticles = (collectionId, articlesLookup = []) => {
  const knownById = { ...snapshot.articlesById };
  articlesLookup.forEach((article) => {
    knownById[article.id] = article;
  });

  const collection = snapshot.collections.find((entry) => entry.id === collectionId);
  if (!collection) return [];

  return collection.articleIds.map((id) => knownById[id]).filter(Boolean);
};

export const subscribeCollections = (callback) => {
  const handler = () => callback(getState());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
