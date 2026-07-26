import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The search fan-out.
 *
 * The three resources answer for their own visibility, so this covers the
 * client contract: which endpoints are called, how failures degrade, and that
 * one query never issues the same request twice.
 */

const get = vi.fn();

vi.mock("./apiClient", () => ({
  default: { get: (...args) => get(...args) },
  api: { get: (...args) => get(...args) },
}));

const load = async () => {
  const mod = await import("./searchStore");
  mod.resetSearchCache();
  return mod;
};

const articlesResponse = (items) => ({ data: { data: items } });
const peopleResponse = (items) => ({ data: { data: items } });
const collectionsResponse = (items) => ({ data: { data: { collections: items } } });

const routeTo = (handlers) => (url, config) => {
  const handler = handlers[url];
  if (!handler) throw new Error(`unexpected request: ${url}`);
  return handler(config);
};

beforeEach(() => {
  get.mockReset();
});

afterEach(async () => {
  (await import("./searchStore")).resetSearchCache();
});

describe("normalizeQuery", () => {
  it("trims and collapses whitespace", async () => {
    const { normalizeQuery } = await load();

    expect(normalizeQuery("  design   systems  ")).toBe("design systems");
    expect(normalizeQuery(undefined)).toBe("");
  });
});

describe("searchAll — fan-out", () => {
  it("queries articles, people and collections and groups the results", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([{ id: "a1", title: "Design Systems" }]),
        "/users/search": () => peopleResponse([{ id: "u1", name: "Dana Designer" }]),
        "/collections": () => collectionsResponse([{ id: "c1", name: "Design reading" }]),
      }),
    );

    const { searchAll } = await load();
    const result = await searchAll("design");

    expect(result.articles).toHaveLength(1);
    expect(result.people).toHaveLength(1);
    expect(result.collections).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(result.partial).toBe(false);
  });

  it("sends the normalised term to every endpoint", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([]),
        "/users/search": () => peopleResponse([]),
        "/collections": () => collectionsResponse([]),
      }),
    );

    const { searchAll } = await load();
    await searchAll("  design   systems ");

    expect(get).toHaveBeenCalledWith("/articles/discover", { params: { search: "design systems", limit: 12 } });
    expect(get).toHaveBeenCalledWith("/users/search", { params: { search: "design systems", limit: 12 } });
    expect(get).toHaveBeenCalledWith("/collections", { params: { search: "design systems" } });
  });

  it("skips the collections request when signed out — it needs a session", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([{ id: "a1" }]),
        "/users/search": () => peopleResponse([]),
      }),
    );

    const { searchAll } = await load();
    const result = await searchAll("design", { signedIn: false });

    expect(get).not.toHaveBeenCalledWith("/collections", expect.anything());
    expect(result.collections).toEqual([]);
    expect(result.articles).toHaveLength(1);
  });

  it("returns empty without calling the API for a query below the minimum", async () => {
    const { searchAll } = await load();

    const result = await searchAll("a");

    expect(get).not.toHaveBeenCalled();
    expect(result).toMatchObject({ articles: [], collections: [], people: [], total: 0 });
  });
});

describe("searchAll — failure handling", () => {
  it("still returns articles when people or collections fail, flagged partial", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([{ id: "a1" }]),
        "/users/search": () => Promise.reject(new Error("people down")),
        "/collections": () => Promise.reject(new Error("collections down")),
      }),
    );

    const { searchAll } = await load();
    const result = await searchAll("design");

    expect(result.articles).toHaveLength(1);
    expect(result.people).toEqual([]);
    expect(result.collections).toEqual([]);
    expect(result.partial).toBe(true);
  });

  it("rejects when the article search fails — the page has nothing to show", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => Promise.reject(new Error("search is down")),
        "/users/search": () => peopleResponse([]),
        "/collections": () => collectionsResponse([]),
      }),
    );

    const { searchAll } = await load();

    await expect(searchAll("design")).rejects.toThrow("search is down");
  });
});

describe("searchAll — duplicate requests", () => {
  it("shares one in-flight fan-out between concurrent callers", async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });

    get.mockImplementation(
      routeTo({
        "/articles/discover": async () => { await gate; return articlesResponse([]); },
        "/users/search": () => peopleResponse([]),
        "/collections": () => collectionsResponse([]),
      }),
    );

    const { searchAll } = await load();

    const both = Promise.all([searchAll("design"), searchAll("design")]);
    await new Promise((r) => setTimeout(r, 10));

    // Three endpoints, not six: the second call joined the first.
    expect(get).toHaveBeenCalledTimes(3);

    release();
    const [first, second] = await both;
    expect(first).toBe(second);
  });

  it("issues a fresh fan-out for a different query", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([]),
        "/users/search": () => peopleResponse([]),
        "/collections": () => collectionsResponse([]),
      }),
    );

    const { searchAll } = await load();

    await searchAll("design");
    await searchAll("systems");

    expect(get).toHaveBeenCalledTimes(6);
  });

  it("does not memoise past the request — a repeat search re-runs", async () => {
    get.mockImplementation(
      routeTo({
        "/articles/discover": () => articlesResponse([]),
        "/users/search": () => peopleResponse([]),
        "/collections": () => collectionsResponse([]),
      }),
    );

    const { searchAll } = await load();

    await searchAll("design");
    await searchAll("design");

    // Sequential calls are two separate searches; only concurrent ones share.
    expect(get).toHaveBeenCalledTimes(6);
  });
});
