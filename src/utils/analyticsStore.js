import api, { unwrap } from "./apiClient";

/**
 * Analytics for the signed-in author.
 *
 * Replaces the hardcoded `stats`, `trafficSources` and `topArticles` arrays in
 * pages/Analytics.jsx with real aggregations over recorded reads.
 */

const EMPTY = {
  summary: {
    totalArticles: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    totalViews: 0,
    totalWords: 0,
    totalReadTime: 0,
    bookmarks: 0,
    periodViews: 0,
    uniqueVisitors: 0,
    engagementRate: 0,
    viewsTrend: 0,
    averageWordsPerArticle: 0,
  },
  daily: [],
  trafficSources: [],
  topArticles: [],
  categories: [],
};

export const emptyAnalytics = () => EMPTY;

/**
 * Full analytics report.
 * @param {number} [days] Trailing window; the page's range selector.
 */
export const fetchAnalytics = async (days = 7) => {
  try {
    return await api.get("/analytics", { params: { days } }).then(unwrap);
  } catch {
    // A failed report should render as zeroes, not crash the dashboard.
    return EMPTY;
  }
};

/** Compact totals for the dashboard stat cards. */
export const fetchDashboardSummary = async () => {
  try {
    const data = await api.get("/analytics/summary").then(unwrap);
    return data.summary;
  } catch {
    return EMPTY.summary;
  }
};

/* ---------------------------------------------------------------------------
 * Cached summary
 *
 * `GET /analytics/summary` already returns the author's real totals — article
 * counts, views, words, bookmarks. Several places used to hardcode those
 * numbers. Caching one response here means the sidebar count and the profile
 * stats share a single request instead of issuing one each.
 * ------------------------------------------------------------------------ */

const SUMMARY_EVENT = "quillora-summary-change";

let summarySnapshot = null;
let summaryInFlight = null;

/** Cached totals, or null until the first fetch resolves. */
export const getSummary = () => summarySnapshot;

export const isSummaryLoaded = () => summarySnapshot !== null;

/** Loads the totals once; concurrent callers share the request. */
export const refreshSummary = async () => {
  if (summaryInFlight) return summaryInFlight;

  summaryInFlight = fetchDashboardSummary()
    .then((summary) => {
      summarySnapshot = summary;
      window.dispatchEvent(new Event(SUMMARY_EVENT));
      return summary;
    })
    .finally(() => {
      summaryInFlight = null;
    });

  return summaryInFlight;
};

export const subscribeSummary = (callback) => {
  const handler = () => callback(getSummary());
  window.addEventListener(SUMMARY_EVENT, handler);
  return () => window.removeEventListener(SUMMARY_EVENT, handler);
};

/** Test seam: drops the cached snapshot. */
export const resetSummary = () => {
  summarySnapshot = null;
  summaryInFlight = null;
};
