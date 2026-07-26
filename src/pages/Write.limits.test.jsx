import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * How the editor behaves against a plan limit.
 *
 * Two things matter: the limit is explained before the author invests in a
 * draft, and a server refusal is never dressed up as a save.
 */

let quota = null;

const createArticle = vi.fn();
const updateArticle = vi.fn();
const fetchEntitlements = vi.fn();

vi.mock("../utils/entitlementsStore", () => ({
  capability: () => quota,
  fetchEntitlements: () => fetchEntitlements(),
  subscribeEntitlements: () => () => {},
}));

vi.mock("../utils/articlesStore", () => ({
  createArticle: (...a) => createArticle(...a),
  updateArticle: (...a) => updateArticle(...a),
  // A plain function, not a vi.fn: the suite runs with `restoreMocks`, which
  // would strip a mockResolvedValue and leave this returning undefined.
  fetchArticleById: () => Promise.resolve(null),
  // The page derives its default title from the author's real articles.
  getArticles: () => [],
  refreshArticles: () => Promise.resolve([]),
  subscribeArticles: () => () => {},
}));

/*
 * A new article now opens with an empty editor, and saving an empty document
 * is refused. These tests are about the plan limit, so the editor is stubbed
 * with real content to get past that guard.
 */
vi.mock("../components/editer/Editer", async () => {
  const { forwardRef, useImperativeHandle } = await vi.importActual("react");

  const Editor = forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => ({
      getHTML: () => "<p>Some real body text.</p>",
      isEmpty: () => false,
    }));
    return null;
  });
  Editor.displayName = "EditorStub";

  return { default: Editor };
});

vi.mock("../utils/profileStore", () => ({
  getProfile: () => ({ name: "Alex Rivera", avatar: "" }),
  getInitials: (n) => (n ? n.slice(0, 2).toUpperCase() : ""),
}));

const { Write } = await import("./Write");

const renderWrite = (entry = "/dashboard/write") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/dashboard/write" element={<Write />} />
        <Route path="/dashboard/upgrade" element={<div>Plans page</div>} />
        <Route path="/dashboard/my-article" element={<div>My articles</div>} />
      </Routes>
    </MemoryRouter>,
  );

const AT_LIMIT = { limit: 3, usage: 3, remaining: 0, enforced: true, reached: true };
const HEADROOM = { limit: 3, usage: 1, remaining: 2, enforced: true, reached: false };

const LIMIT_REJECTION = {
  response: {
    status: 403,
    data: {
      success: false,
      code: "PLAN_LIMIT_REACHED",
      message: "The Starter plan includes 3 published articles. Unpublish or archive one, or upgrade to publish more. Your drafts are unaffected.",
    },
  },
};

beforeEach(() => {
  quota = null;
  createArticle.mockReset();
  updateArticle.mockReset();
  fetchEntitlements.mockReset().mockResolvedValue(null);
});

describe("Write — explaining the limit up front", () => {
  it("warns when the plan's published articles are used up", async () => {
    quota = AT_LIMIT;
    renderWrite();

    await waitFor(() =>
      expect(screen.getByText(/published all 3 articles your plan allows/i)).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: /view plans/i })).toHaveAttribute(
      "href",
      "/dashboard/upgrade",
    );
  });

  it("says drafts still work and how to free a slot", async () => {
    quota = AT_LIMIT;
    renderWrite();

    await waitFor(() => expect(screen.getByText(/Saving\s+drafts still works/i)).toBeInTheDocument());
  });

  it("shows nothing when there is headroom", async () => {
    quota = HEADROOM;
    renderWrite();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    expect(screen.queryByText(/published all/i)).not.toBeInTheDocument();
  });

  it("shows nothing while entitlements are unknown", async () => {
    quota = null;
    renderWrite();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    expect(screen.queryByText(/published all/i)).not.toBeInTheDocument();
  });

  it("still warns while editing a draft, because publishing it would be refused", async () => {
    quota = AT_LIMIT;
    renderWrite("/dashboard/write?edit=abc123");

    // The limit is on publishing, not on opening the editor, so an author
    // working on an existing draft needs to know Publish will not go through.
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText(/published all 3 articles your plan allows/i)).toBeInTheDocument(),
    );
  });
});

describe("Write — a refused save is not a save", () => {
  it("surfaces the server's limit message instead of a success toast", async () => {
    const user = userEvent.setup();
    quota = HEADROOM; // The client believes there is room; the server disagrees.
    createArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWrite();

    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() =>
      expect(screen.getByText(/Starter plan includes 3 published articles/i)).toBeInTheDocument(),
    );

    // No success wording, and no navigation away from the editor.
    expect(screen.queryByText(/Article published/i)).not.toBeInTheDocument();
    expect(screen.queryByText("My articles")).not.toBeInTheDocument();
  });

  it("does not leak the machine-readable code into the message", async () => {
    const user = userEvent.setup();
    quota = HEADROOM;
    createArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWrite();
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => expect(screen.getByText(/upgrade to publish more/i)).toBeInTheDocument());
    expect(screen.queryByText(/PLAN_LIMIT_REACHED/)).not.toBeInTheDocument();
  });

  it("still saves normally when the server accepts", async () => {
    const user = userEvent.setup();
    quota = HEADROOM;
    createArticle.mockResolvedValue({ id: "new-1", title: "The Future of Neural Prose" });

    renderWrite();
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => expect(createArticle).toHaveBeenCalled());
    expect(screen.getByText(/Article published/i)).toBeInTheDocument();
  });
});
