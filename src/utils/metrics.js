// Article metrics now come from the backend, which serialises real word
// counts, view totals, an SEO score and a reader-type label onto every
// article. The previous hash-derived placeholders have been removed; the
// formatting helpers below are unchanged.

/**
 * Reads the metrics the API already attached to an article.
 * Falls back to zeroes so a partially-loaded card still renders.
 */
export const articleMetrics = (article = {}) => ({
  words: article.words ?? article.wordCount ?? 0,
  views: article.views ?? 0,
  seo: article.seo ?? 0,
  readerType: article.readerType ?? "Article",
});

export const formatCount = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
};

export const formatViews = (n) => (n ?? 0).toLocaleString("en-US");

export const formatWords = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k words` : `${n} words`;
