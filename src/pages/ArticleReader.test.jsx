import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * The publication gate on the public reader.
 *
 * Authorisation itself is the server's: `GET /articles/:id` 404s anything
 * unpublished or private for a non-author. These tests cover the client half —
 * that a published article renders, and that anything the server does hand
 * back which is not Published is refused a public page rather than displayed.
 */

const fetchPublicArticle = vi.fn();
const recordArticleView = vi.fn();

vi.mock("../utils/articlesStore", () => ({
  fetchPublicArticle: (...args) => fetchPublicArticle(...args),
}));
vi.mock("../utils/discoverStore", () => ({
  recordArticleView: (...args) => recordArticleView(...args),
}));

const { default: ArticleReader } = await import("./ArticleReader");

const PUBLISHED = {
  id: "6a646e52e31f34264a01f56e",
  title: "How Generative AI Is Reshaping Creative Work",
  content: "<p>Generative models have moved from research demos to daily tools.</p>",
  excerpt: "An excerpt",
  author: "Alex Rivera",
  authorRole: "Editorial Lead",
  category: "AI",
  readingTime: "1 min read",
  publishedAt: "2025-12-04T09:00:00.000Z",
  status: "Published",
  tags: ["AI"],
};

const DRAFT = {
  ...PUBLISHED,
  id: "6a646e52e31f34264a01f56f",
  title: "User Interviews: The Art of Asking Better Questions",
  content: "<p>Secret unpublished body text.</p>",
  status: "Draft",
};

const renderReader = (id) =>
  render(
    <MemoryRouter initialEntries={[`/article/${id}`]}>
      <Routes>
        <Route path="/article/:id" element={<ArticleReader />} />
      </Routes>
    </MemoryRouter>,
  );

describe("ArticleReader — published articles are publicly readable", () => {
  beforeEach(() => {
    fetchPublicArticle.mockReset();
    recordArticleView.mockReset();
  });

  it("renders the title, author, date and body", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });

    renderReader(PUBLISHED.id);

    await waitFor(() => expect(screen.getByText(PUBLISHED.title)).toBeInTheDocument());
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText(/Generative models have moved/)).toBeInTheDocument();

    // The reader formats in the visitor's locale, so the expectation is built
    // the same way rather than hard-coding one region's date order.
    const expectedDate = new Date(PUBLISHED.publishedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it("renders the stored HTML as markup, not as escaped text", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });

    const { container } = renderReader(PUBLISHED.id);

    await waitFor(() => expect(screen.getByText(PUBLISHED.title)).toBeInTheDocument());
    expect(container.querySelector("p")).not.toBeNull();
    expect(container.textContent).not.toContain("<p>");
  });

  it("records a view for a published article", async () => {
    fetchPublicArticle.mockResolvedValue({ article: PUBLISHED, isOwner: false });

    renderReader(PUBLISHED.id);

    await waitFor(() => expect(recordArticleView).toHaveBeenCalledWith(PUBLISHED.id));
  });

  it("shows a loading state before the article arrives, never a blank page", () => {
    fetchPublicArticle.mockReturnValue(new Promise(() => {}));

    const { container } = renderReader(PUBLISHED.id);

    expect(screen.getByText("Loading article…")).toBeInTheDocument();
    expect(container).not.toBeEmptyDOMElement();
  });
});

describe("ArticleReader — drafts are not publicly readable", () => {
  beforeEach(() => {
    fetchPublicArticle.mockReset();
    recordArticleView.mockReset();
  });

  it("refuses to render a draft even when the server returns one to its author", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });

    const { container } = renderReader(DRAFT.id);

    await waitFor(() =>
      expect(screen.getByText("This article hasn't been published")).toBeInTheDocument(),
    );

    // Neither the title nor the body reaches the page.
    expect(screen.queryByText(DRAFT.title)).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("Secret unpublished body text");
  });

  it("does not count a view for an unpublished article", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });

    renderReader(DRAFT.id);

    await waitFor(() =>
      expect(screen.getByText("This article hasn't been published")).toBeInTheDocument(),
    );
    expect(recordArticleView).not.toHaveBeenCalled();
  });

  it("offers the author the editor, and tells a non-author nothing about the draft", async () => {
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: true });
    const owner = renderReader(DRAFT.id);

    await waitFor(() => expect(screen.getByText(/Only you can see this draft/)).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /open in editor/i })).toHaveAttribute(
      "href",
      `/dashboard/write?edit=${DRAFT.id}`,
    );
    owner.unmount();

    // The same payload without ownership reveals no draft-specific wording.
    fetchPublicArticle.mockResolvedValue({ article: DRAFT, isOwner: false });
    renderReader(DRAFT.id);

    await waitFor(() =>
      expect(screen.getByText("This article hasn't been published")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Only you can see this draft/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open in editor/i })).not.toBeInTheDocument();
  });

  it("shows the unavailable state when the server 404s (the signed-out draft case)", async () => {
    fetchPublicArticle.mockRejectedValue(
      Object.assign(new Error("Not found"), { response: { status: 404 } }),
    );

    renderReader(DRAFT.id);

    await waitFor(() =>
      expect(screen.getByText("This article isn't available")).toBeInTheDocument(),
    );
    expect(recordArticleView).not.toHaveBeenCalled();
  });

  it("shows the same unavailable state for an unknown id, revealing nothing", async () => {
    fetchPublicArticle.mockRejectedValue(
      Object.assign(new Error("Not found"), { response: { status: 404 } }),
    );

    renderReader("000000000000000000000000");

    await waitFor(() =>
      expect(screen.getByText("This article isn't available")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/hasn't been published/)).not.toBeInTheDocument();
  });
});
