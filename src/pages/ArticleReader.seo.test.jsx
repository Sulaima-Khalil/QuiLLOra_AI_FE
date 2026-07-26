import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * Page metadata for public content.
 *
 * The security-relevant rule: only a genuinely published article may claim a
 * canonical URL or be indexable. A draft reaching this page — which happens
 * when its own author opens the link — must leak nothing to a crawler.
 */

const fetchPublicArticle = vi.fn();

vi.mock("../utils/articlesStore", () => ({
  fetchPublicArticle: (...a) => fetchPublicArticle(...a),
}));
vi.mock("../utils/discoverStore", () => ({ recordArticleView: vi.fn() }));

const { default: ArticleReader } = await import("./ArticleReader");
const { default: AuthorProfile } = await import("./AuthorProfile");

const fetchPublicProfile = vi.fn();
vi.mock("../utils/profileStore", () => ({
  fetchPublicProfile: (...a) => fetchPublicProfile(...a),
  getInitials: (n) => (n ? n.slice(0, 2).toUpperCase() : ""),
}));

const PUBLISHED = {
  id: "art-published",
  title: "Designing Resilient Systems",
  excerpt: "On failure domains and graceful degradation.",
  content: "<p>Body.</p>",
  author: "Alex Rivera",
  category: "Engineering",
  tags: ["Systems"],
  status: "Published",
  publishedAt: "2026-01-15T09:00:00.000Z",
  updatedAt: "2026-01-16T09:00:00.000Z",
  wordCount: 900,
  coverImage: "https://cdn.example.test/cover.png",
};

const DRAFT = {
  ...PUBLISHED,
  id: "art-draft",
  title: "Secret Unpublished Manuscript",
  excerpt: "Nobody should see this summary.",
  status: "Draft",
};

const head = {
  title: () => document.title,
  meta: (sel) => document.head.querySelector(sel)?.getAttribute("content"),
  canonical: () => document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
  jsonLd: () => {
    const node = document.getElementById("seo-json-ld");
    return node ? JSON.parse(node.textContent) : null;
  },
};

const renderReader = (id) =>
  render(
    <MemoryRouter initialEntries={[`/article/${id}`]}>
      <Routes>
        <Route path="/article/:id" element={<ArticleReader />} />
      </Routes>
    </MemoryRouter>,
  );

const renderAuthor = (identifier) =>
  render(
    <MemoryRouter initialEntries={[`/author/${identifier}`]}>
      <Routes>
        <Route path="/author/:identifier" element={<AuthorProfile />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  fetchPublicArticle.mockReset();
  fetchPublicProfile.mockReset();
  document.head.querySelectorAll("[data-seo-managed]").forEach((el) => el.remove());
});

describe("Article metadata — published", () => {
  it("uses the real title and excerpt", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() => expect(head.title()).toContain("Designing Resilient Systems"));
    expect(head.meta('meta[name="description"]')).toBe(PUBLISHED.excerpt);
    expect(head.meta('meta[property="og:description"]')).toBe(PUBLISHED.excerpt);
  });

  it("emits a stable canonical for the article", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() =>
      expect(head.canonical()).toBe(`${window.location.origin}/article/art-published`),
    );
    expect(head.meta('meta[property="og:url"]')).toBe(head.canonical());
  });

  it("marks it as an article with real dates and author", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() => expect(head.meta('meta[property="og:type"]')).toBe("article"));
    expect(head.meta('meta[property="article:published_time"]')).toBe(PUBLISHED.publishedAt);
    expect(head.meta('meta[property="article:modified_time"]')).toBe(PUBLISHED.updatedAt);
    expect(head.meta('meta[property="article:author"]')).toBe("Alex Rivera");
  });

  it("is indexable", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() => expect(head.canonical()).toBeTruthy());
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("emits Article structured data from real fields only", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() => expect(head.jsonLd()).toBeTruthy());
    const data = head.jsonLd();

    expect(data).toMatchObject({
      "@type": "Article",
      headline: "Designing Resilient Systems",
      datePublished: PUBLISHED.publishedAt,
      author: { "@type": "Person", name: "Alex Rivera" },
      wordCount: 900,
    });
    expect(data.aggregateRating).toBeUndefined();
    expect(data.reviewCount).toBeUndefined();
  });

  it("omits fields the API did not return", async () => {
    const sparse = { ...PUBLISHED, publishedAt: null, wordCount: 0, tags: [], coverImage: "" };
    fetchPublicArticle.mockResolvedValue({ article: sparse, isOwner: false });
    renderReader(sparse.id);

    await waitFor(() => expect(head.jsonLd()).toBeTruthy());
    const data = head.jsonLd();

    expect(data).not.toHaveProperty("datePublished");
    expect(data).not.toHaveProperty("wordCount");
    expect(data).not.toHaveProperty("keywords");
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
  });

  it("uses a real cover image only when it is an absolute URL", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });
    renderReader(PUBLISHED.id);

    await waitFor(() =>
      expect(head.meta('meta[property="og:image"]')).toBe("https://cdn.example.test/cover.png"),
    );

    // A bundled local path is not fetchable by a crawler, so it is skipped.
    document.head.querySelectorAll("[data-seo-managed]").forEach((el) => el.remove());
    fetchPublicArticle.mockResolvedValue({
      article: { ...PUBLISHED, id: "art-local", coverImage: "/assets/local-cover.png" },
      isOwner: false,
    });
    renderReader("art-local");

    await waitFor(() => expect(head.canonical()).toContain("art-local"));
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
  });
});

describe("Article metadata — a draft must leak nothing", () => {
  it("emits no canonical for a draft, even to its author", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });
    renderReader(DRAFT.id);

    await waitFor(() => expect(head.title()).toContain("unavailable"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("marks a draft noindex", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });
    renderReader(DRAFT.id);

    await waitFor(() => expect(head.meta('meta[name="robots"]')).toBe("noindex, nofollow"));
  });

  it("puts no draft title or excerpt anywhere in the head", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });
    renderReader(DRAFT.id);

    await waitFor(() => expect(head.meta('meta[name="robots"]')).toBe("noindex, nofollow"));

    expect(document.head.innerHTML).not.toContain("Secret Unpublished Manuscript");
    expect(document.head.innerHTML).not.toContain("Nobody should see this summary");
    expect(document.title).not.toContain("Secret Unpublished Manuscript");
  });

  it("emits no structured data for a draft", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });
    renderReader(DRAFT.id);

    await waitFor(() => expect(head.meta('meta[name="robots"]')).toBe("noindex, nofollow"));
    expect(head.jsonLd()).toBeNull();
  });
});

describe("Article metadata — unknown article", () => {
  it("emits no canonical for an id that does not exist", async () => {
    fetchPublicArticle.mockRejectedValue(Object.assign(new Error("404"), { response: { status: 404 } }));
    renderReader("does-not-exist");

    await waitFor(() => expect(head.meta('meta[name="robots"]')).toBe("noindex, nofollow"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("does not invent a canonical from the requested id", async () => {
    fetchPublicArticle.mockRejectedValue(Object.assign(new Error("404"), { response: { status: 404 } }));
    renderReader("made-up-id");

    await waitFor(() => expect(head.title()).toContain("unavailable"));
    expect(document.head.innerHTML).not.toContain("made-up-id");
  });
});

describe("Author metadata", () => {
  const PROFILE = {
    profile: {
      id: "u1",
      username: "dana",
      name: "Dana Designer",
      bio: "Writes about type and systems.",
      role: "Design Lead",
      avatar: "https://cdn.example.test/dana.png",
    },
    articles: [],
    stats: {},
  };

  it("uses the author's real name and bio", async () => {
    fetchPublicProfile.mockResolvedValue(PROFILE);
    renderAuthor("dana");

    await waitFor(() => expect(head.title()).toContain("Dana Designer"));
    expect(head.meta('meta[name="description"]')).toBe("Writes about type and systems.");
  });

  it("canonicalises to the username, so id and username do not compete", async () => {
    fetchPublicProfile.mockResolvedValue(PROFILE);
    // Reached by id, but the canonical points at the username.
    renderAuthor("u1");

    await waitFor(() =>
      expect(head.canonical()).toBe(`${window.location.origin}/author/dana`),
    );
  });

  it("falls back to the id when there is no username", async () => {
    fetchPublicProfile.mockResolvedValue({
      ...PROFILE,
      profile: { ...PROFILE.profile, username: "" },
    });
    renderAuthor("u1");

    await waitFor(() => expect(head.canonical()).toBe(`${window.location.origin}/author/u1`));
  });

  it("emits Person structured data from real fields", async () => {
    fetchPublicProfile.mockResolvedValue(PROFILE);
    renderAuthor("dana");

    await waitFor(() => expect(head.jsonLd()).toBeTruthy());
    expect(head.jsonLd()).toMatchObject({
      "@type": "Person",
      name: "Dana Designer",
      description: "Writes about type and systems.",
      jobTitle: "Design Lead",
    });
  });

  it("emits no canonical for an unknown author", async () => {
    fetchPublicProfile.mockRejectedValue(new Error("404"));
    renderAuthor("nobody");

    await waitFor(() => expect(head.meta('meta[name="robots"]')).toBe("noindex, nofollow"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(head.jsonLd()).toBeNull();
  });
});
