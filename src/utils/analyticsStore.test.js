import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The cached summary store.
 *
 * Its reason for existing is that two screens — the sidebar count and the
 * profile stats — need the same real totals, and neither should hardcode them
 * or issue its own request.
 */

const get = vi.fn();

vi.mock("./apiClient", () => ({
  default: { get: (...args) => get(...args) },
  api: { get: (...args) => get(...args) },
  unwrap: (r) => r?.data?.data ?? null,
}));

const SUMMARY = {
  totalArticles: 6,
  published: 3,
  drafts: 2,
  archived: 1,
  totalViews: 1280,
  totalWords: 9400,
  totalReadTime: 47,
  bookmarks: 4,
};

const load = async () => {
  const mod = await import("./analyticsStore");
  mod.resetSummary();
  return mod;
};

beforeEach(() => {
  get.mockReset();
});

describe("summary store", () => {
  it("is empty before the first fetch, so callers can tell 'unknown' from zero", async () => {
    const { getSummary, isSummaryLoaded } = await load();

    expect(getSummary()).toBeNull();
    expect(isSummaryLoaded()).toBe(false);
  });

  it("caches the author's real totals from /analytics/summary", async () => {
    get.mockResolvedValue({ data: { data: { summary: SUMMARY } } });

    const { refreshSummary, getSummary } = await load();
    await refreshSummary();

    expect(get).toHaveBeenCalledWith("/analytics/summary");
    expect(getSummary()).toEqual(SUMMARY);
  });

  it("shares one request between concurrent callers — the sidebar and the profile", async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    get.mockImplementation(async () => {
      await gate;
      return { data: { data: { summary: SUMMARY } } };
    });

    const { refreshSummary } = await load();

    const both = Promise.all([refreshSummary(), refreshSummary()]);
    await new Promise((r) => setTimeout(r, 10));

    expect(get).toHaveBeenCalledTimes(1);

    release();
    await both;
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers when the totals land", async () => {
    get.mockResolvedValue({ data: { data: { summary: SUMMARY } } });

    const { refreshSummary, subscribeSummary } = await load();
    const listener = vi.fn();
    const off = subscribeSummary(listener);

    await refreshSummary();

    expect(listener).toHaveBeenCalledWith(SUMMARY);
    off();
  });

  it("falls back to zeroes rather than throwing when the request fails", async () => {
    get.mockRejectedValue(new Error("analytics down"));

    const { refreshSummary, getSummary } = await load();
    await refreshSummary();

    expect(getSummary()).toMatchObject({ totalArticles: 0, totalViews: 0 });
  });
});
