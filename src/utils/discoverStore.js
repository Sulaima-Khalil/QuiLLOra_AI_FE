import ai1 from "@/assets/ai1.png";
import ai2 from "@/assets/ai2.png";
import rain1 from "@/assets/rain1.png";
import rain2 from "@/assets/rain2.png";
import rain3 from "@/assets/rain3.png";
import rain4 from "@/assets/rain4.png";
import design1 from "@/assets/design1.png";
import design2 from "@/assets/design2.png";
import engineering from "@/assets/engineering.png";
import api from "./apiClient";

/**
 * The public Discover feed.
 *
 * Replaces the hardcoded DISCOVER_ARTICLES array with the backend's published
 * public articles. Works signed-out; when a reader is signed in, each item
 * carries `isBookmarked`.
 */

const COVERS = [ai1, ai2, rain1, rain2, rain3, rain4, design1, design2, engineering];

const CHANGE_EVENT = "inkflow-discover-change";

let snapshot = [];
let categories = [];
let loaded = false;
let inFlight = null;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

/** Stable local cover for articles without an uploaded image. */
const withCover = (article) => {
  if (article.img) return article;

  const key = String(article.id ?? "");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index);
    hash |= 0;
  }

  return { ...article, img: COVERS[Math.abs(hash) % COVERS.length] };
};

export const getDiscoverArticles = () => snapshot;

export const getDiscoverCategories = () => categories;

export const isDiscoverLoaded = () => loaded;

/**
 * Loads the public feed.
 * @param {{ search?: string, category?: string, limit?: number }} [params]
 */
export const refreshDiscover = async (params = {}) => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/articles/discover", {
      params: {
        limit: params.limit ?? 50,
        ...(params.search ? { search: params.search } : {}),
        ...(params.category && params.category !== "All" ? { category: params.category } : {}),
      },
    })
    .then((response) => {
      snapshot = (response.data.data ?? []).map(withCover);
      loaded = true;
      emit();
      return snapshot;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Category chips for the Discover filter bar. */
export const refreshCategories = async () => {
  const response = await api.get("/articles/categories");
  categories = response.data.data?.categories ?? [];
  emit();
  return categories;
};

/**
 * Records that an article was read.
 *
 * Fire-and-forget: analytics must never block or break rendering, and the
 * backend already ignores repeat reads, author self-views and drafts.
 */
export const recordArticleView = (articleId) => {
  api
    .post(`/articles/${articleId}/view`, { referrer: document.referrer || "" })
    .catch(() => {});
};

export const subscribeDiscover = (callback) => {
  const handler = () => callback(getDiscoverArticles());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
