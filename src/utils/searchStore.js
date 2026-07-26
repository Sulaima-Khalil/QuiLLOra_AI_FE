import api from "./apiClient";

/**
 * Global search across the three content types the search bar promises.
 *
 * There is no single `/search` endpoint and deliberately so: the three
 * resources have different authorization scopes — articles are public,
 * collections are private to their owner, people are public profiles — and an
 * aggregate endpoint would have to blend all three in one place. Each resource
 * answers for its own visibility, and this module fans out to them.
 *
 * A collections request needs a session, so signed-out visitors simply get no
 * collection results rather than an error.
 */

/** Below this a regex matches most of the table; the API rejects it too. */
export const MIN_QUERY_LENGTH = 2;

export const normalizeQuery = (value) => String(value ?? "").trim().replace(/\s+/g, " ");

/**
 * One in-flight request per query string.
 *
 * Discover re-runs its effect whenever the URL changes, and React 18 mounts
 * effects twice in development. Without this, the same query would fan out to
 * six requests instead of three.
 */
let inFlight = { key: null, promise: null };

const settledValue = (result, fallback) =>
  result.status === "fulfilled" ? result.value : fallback;

/**
 * @param {string} query
 * @param {{ limit?: number, signedIn?: boolean }} [options]
 * @returns {Promise<{ query: string, articles: [], collections: [], people: [], total: number, partial: boolean }>}
 */
export const searchAll = async (query, { limit = 12, signedIn = true } = {}) => {
  const term = normalizeQuery(query);

  if (term.length < MIN_QUERY_LENGTH) {
    return { query: term, articles: [], collections: [], people: [], total: 0, partial: false };
  }

  const key = `${term}|${limit}|${signedIn}`;
  if (inFlight.key === key) return inFlight.promise;

  const promise = (async () => {
    const requests = [
      api.get("/articles/discover", { params: { search: term, limit } }),
      api.get("/users/search", { params: { search: term, limit } }),
      signedIn ? api.get("/collections", { params: { search: term } }) : Promise.resolve(null),
    ];

    const [articlesResult, peopleResult, collectionsResult] = await Promise.allSettled(requests);

    const articles = settledValue(articlesResult, null)?.data?.data ?? [];
    const people = settledValue(peopleResult, null)?.data?.data ?? [];
    const collections = settledValue(collectionsResult, null)?.data?.data?.collections ?? [];

    // Articles are the headline result type; if that request failed the page
    // has nothing worth showing and should surface the error instead.
    if (articlesResult.status === "rejected") throw articlesResult.reason;

    return {
      query: term,
      articles,
      collections,
      people,
      total: articles.length + collections.length + people.length,
      // One of the secondary lookups failed; results are incomplete but usable.
      partial: peopleResult.status === "rejected" || collectionsResult.status === "rejected",
    };
  })();

  inFlight = { key, promise };

  try {
    return await promise;
  } finally {
    if (inFlight.key === key) inFlight = { key: null, promise: null };
  }
};

/** Test seam: drops any memoised in-flight request. */
export const resetSearchCache = () => {
  inFlight = { key: null, promise: null };
};
