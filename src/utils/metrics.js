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

/** Coarse "2h ago" / "3 days ago" label for timestamps from the API. */
export const timeAgo = (value) => {
  if (!value) return "";

  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 60) return "just now";

  const steps = [
    { unit: "m", size: 60 },
    { unit: "h", size: 60 },
    { unit: "d", size: 24 },
  ];

  let amount = Math.floor(seconds / 60);
  let unit = "m";

  for (let i = 1; i < steps.length && amount >= steps[i].size; i += 1) {
    amount = Math.floor(amount / steps[i].size);
    unit = steps[i].unit;
  }

  if (unit === "d" && amount >= 30) {
    const months = Math.floor(amount / 30);
    return `${months}mo ago`;
  }

  return `${amount}${unit} ago`;
};
