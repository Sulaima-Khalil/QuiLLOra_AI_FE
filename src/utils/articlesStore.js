import ai1 from "@/assets/ai1.png";
import ai2 from "@/assets/ai2.png";
import rain1 from "@/assets/rain1.png";
import rain2 from "@/assets/rain2.png";
import rain3 from "@/assets/rain3.png";
import rain4 from "@/assets/rain4.png";
import design1 from "@/assets/design1.png";
import design2 from "@/assets/design2.png";
import engineering from "@/assets/engineering.png";
import api, { unwrap } from "./apiClient";

/**
 * The signed-in author's articles, backed by the API.
 *
 * A cached snapshot keeps `getArticles()` synchronous for components that
 * read it during render (`useState(getArticles)`); `subscribeArticles` lets
 * them re-render once the server responds. Mutations are async and resolve
 * after the cache has been refreshed, so a caller can simply await them.
 */

const COVERS = [ai1, ai2, rain1, rain2, rain3, rain4, design1, design2, engineering];
export const DEFAULT_COVER = ai1;

const CHANGE_EVENT = "inkflow-articles-change";

let snapshot = [];
let loaded = false;
let inFlight = null;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

/**
 * Assigns a stable local cover to articles with no uploaded image, so the
 * dashboard keeps the look of the original design instead of showing gaps.
 * Derived from the id, so a given article always gets the same picture.
 */
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

const setSnapshot = (articles) => {
  snapshot = articles.map(withCover);
  loaded = true;
  emit();
  return snapshot;
};

/* ---------------------------------------------------------------------------
 * Reads
 * ------------------------------------------------------------------------ */

/** Cached list. Empty until `refreshArticles()` has resolved once. */
export const getArticles = () => snapshot;

export const areArticlesLoaded = () => loaded;

/**
 * Loads every article belonging to the signed-in author.
 * Concurrent calls share one request.
 */
export const refreshArticles = async () => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/articles", { params: { limit: 100, sort: "-createdAt" } })
    .then((response) => setSnapshot(response.data.data ?? []))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Cached lookup — synchronous, for components that already hold the list. */
export const getArticleById = (id) => snapshot.find((article) => article.id === id);

/** Full article including its HTML body, fetched fresh for the editor. */
export const fetchArticleById = async (id) => {
  const data = unwrap(await api.get(`/articles/${id}`));
  return withCover(data.article);
};

/* ---------------------------------------------------------------------------
 * Mutations
 * ------------------------------------------------------------------------ */

/**
 * Creates an article.
 *
 * Accepts the same object the Write and AI Writer pages already build; the
 * frontend's `author` and `date` fields are ignored because the server
 * derives both from the session.
 */
export const createArticle = async ({
  title,
  content = "",
  status = "Draft",
  category,
  excerpt,
  tags,
  visibility,
  seoTitle,
  generatedByAI,
}) => {
  const data = unwrap(
    await api.post("/articles", {
      title: title?.trim() || "Untitled Article",
      content,
      status,
      ...(category ? { category } : {}),
      ...(excerpt ? { excerpt } : {}),
      ...(tags?.length ? { tags } : {}),
      ...(visibility ? { visibility } : {}),
      ...(seoTitle ? { seoTitle } : {}),
      ...(generatedByAI ? { generatedByAI } : {}),
    }),
  );

  await refreshArticles();
  return withCover(data.article);
};

/** Applies a partial update and refreshes the cache. */
export const updateArticle = async (id, partial) => {
  await api.put(`/articles/${id}`, partial);
  return refreshArticles();
};

export const archiveArticle = async (id) => {
  await api.patch(`/articles/${id}/archive`);
  return refreshArticles();
};

export const restoreArticle = async (id) => {
  await api.patch(`/articles/${id}/restore`);
  return refreshArticles();
};

export const deleteArticle = async (id) => {
  await api.delete(`/articles/${id}`);
  return refreshArticles();
};

/** Publishes or un-publishes without touching any other field. */
export const setArticleStatus = async (id, status) => {
  await api.patch(`/articles/${id}/status`, { status });
  return refreshArticles();
};

/** Uploads a cover image for an existing article. */
export const uploadCover = async (id, file) => {
  const form = new FormData();
  form.append("coverImage", file);

  await api.put(`/articles/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
  return refreshArticles();
};

/* ---------------------------------------------------------------------------
 * Notes (Write page side panel)
 * ------------------------------------------------------------------------ */

export const addArticleNote = async (id, text) => {
  const data = unwrap(await api.post(`/articles/${id}/notes`, { text }));
  return data.notes;
};

export const deleteArticleNote = async (id, noteId) => {
  const data = unwrap(await api.delete(`/articles/${id}/notes/${noteId}`));
  return data.notes;
};

export const subscribeArticles = (callback) => {
  const handler = () => callback(getArticles());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
