import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

/**
 * Title handling in the editor.
 *
 * A new article gets the next free default, an author's own title is never
 * overwritten, and an existing article always opens on its persisted title.
 */

let articleList = [];
const createArticle = vi.fn();
const updateArticle = vi.fn();
const fetchArticleById = vi.fn();
const refreshArticles = vi.fn();

vi.mock("../utils/articlesStore", () => ({
  getArticles: () => articleList,
  refreshArticles: () => refreshArticles(),
  subscribeArticles: () => () => {},
  createArticle: (...a) => createArticle(...a),
  updateArticle: (...a) => updateArticle(...a),
  fetchArticleById: (...a) => fetchArticleById(...a),
}));

vi.mock("../utils/entitlementsStore", () => ({
  capability: () => null,
  fetchEntitlements: () => Promise.resolve(null),
  subscribeEntitlements: () => () => {},
}));

/*
 * The editor is stubbed so a test can control what the document contains.
 * A new article now starts genuinely empty, and `savePost` refuses to save an
 * empty document — correct behaviour, but it means a save test has to put
 * something in the editor first.
 */
let editorHtml = "<p>Some real body text.</p>";

vi.mock("../components/editer/Editer", async () => {
  const { forwardRef, useImperativeHandle } = await vi.importActual("react");

  const Editor = forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => ({
      getHTML: () => editorHtml,
      isEmpty: () => !editorHtml,
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

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderWrite = (entry = "/dashboard/write") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LocationProbe />
      <Routes>
        <Route path="/dashboard/write" element={<Write />} />
        <Route path="/dashboard/my-article" element={<div>My articles</div>} />
      </Routes>
    </MemoryRouter>,
  );

const titleBox = () => screen.getByLabelText(/article title/i);

/** The editor's draft-saving control is labelled "Preview". */
const saveDraft = (user) => user.click(screen.getByRole("button", { name: /preview/i }));

beforeEach(() => {
  articleList = [];
  editorHtml = "<p>Some real body text.</p>";
  createArticle.mockReset().mockResolvedValue({ id: "new-1", title: "Untitled" });
  updateArticle.mockReset().mockResolvedValue({ id: "new-1" });
  fetchArticleById.mockReset().mockResolvedValue(null);
  refreshArticles.mockReset().mockResolvedValue([]);
});

describe("Write — default title for a new article", () => {
  it("uses the bare default in an empty workspace", async () => {
    renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));
  });

  it("continues the sequence from the author's real articles", async () => {
    articleList = [{ title: "Untitled" }, { title: "Untitled 2" }];
    renderWrite();

    await waitFor(() => expect(titleBox()).toHaveValue("Untitled 3"));
  });

  it("derives the default from the API list, not localStorage", async () => {
    localStorage.setItem("quillora_untitled_counter", "99");
    articleList = [{ title: "Untitled" }];

    renderWrite();

    await waitFor(() => expect(titleBox()).toHaveValue("Untitled 2"));
    expect(refreshArticles).toHaveBeenCalled();
  });

  it("shows no leftover sample title", async () => {
    const { container } = renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    expect(container.textContent).not.toContain("The Future of Neural Prose");
  });

  it("opens with an empty body, not sample copy", async () => {
    const { container } = renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    expect(container.textContent).not.toContain("The Core Thesis");
    expect(container.textContent).not.toContain("Open with the promise of the piece");
  });

  it("starts with no pre-filled tags", async () => {
    const { container } = renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    expect(container.textContent).not.toContain("Architecture");
  });
});

describe("Write — a custom title is the author's", () => {
  it("is not overwritten when the article list arrives late", async () => {
    const user = userEvent.setup();
    renderWrite();

    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    await user.clear(titleBox());
    await user.type(titleBox(), "My Real Title");

    // The list resolves afterwards and must not reclaim the field.
    articleList = [{ title: "Untitled" }, { title: "Untitled 2" }];
    await new Promise((r) => setTimeout(r, 50));

    expect(titleBox()).toHaveValue("My Real Title");
  });

  it("is sent to the API on save", async () => {
    const user = userEvent.setup();
    renderWrite();

    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));
    await user.clear(titleBox());
    await user.type(titleBox(), "My Real Title");
    await saveDraft(user);

    await waitFor(() =>
      expect(createArticle).toHaveBeenCalledWith(expect.objectContaining({ title: "My Real Title" })),
    );
  });
});

describe("Write — an existing article", () => {
  it("loads its persisted title, never a default", async () => {
    fetchArticleById.mockResolvedValue({
      id: "a1",
      title: "Designing Resilient Systems",
      content: "<p>Body</p>",
      tags: [],
      notes: [],
      status: "Draft",
    });

    renderWrite("/dashboard/write?edit=a1");

    await waitFor(() => expect(titleBox()).toHaveValue("Designing Resilient Systems"));
  });

  it("keeps that title even when other Untitled articles exist", async () => {
    articleList = [{ title: "Untitled" }, { title: "Untitled 2" }];
    fetchArticleById.mockResolvedValue({
      id: "a1",
      title: "Designing Resilient Systems",
      content: "<p>Body</p>",
      tags: [],
      notes: [],
    });

    renderWrite("/dashboard/write?edit=a1");

    await waitFor(() => expect(titleBox()).toHaveValue("Designing Resilient Systems"));
    await new Promise((r) => setTimeout(r, 50));
    expect(titleBox()).toHaveValue("Designing Resilient Systems");
  });

  it("updates rather than creating a second article", async () => {
    const user = userEvent.setup();
    fetchArticleById.mockResolvedValue({
      id: "a1",
      title: "Existing",
      content: "<p>Body</p>",
      tags: [],
      notes: [],
    });

    renderWrite("/dashboard/write?edit=a1");
    await waitFor(() => expect(titleBox()).toHaveValue("Existing"));

    await saveDraft(user);

    await waitFor(() => expect(updateArticle).toHaveBeenCalled());
    expect(createArticle).not.toHaveBeenCalled();
  });
});

describe("Write — reload safety", () => {
  it("puts the new article's id in the URL after the first save", async () => {
    const user = userEvent.setup();
    createArticle.mockResolvedValue({ id: "new-42", title: "My Real Title" });

    renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    await user.clear(titleBox());
    await user.type(titleBox(), "My Real Title");
    await saveDraft(user);

    // A reload now reopens the saved article — with its real title — instead
    // of a blank new one that would be saved as a duplicate.
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/write?edit=new-42"),
    );
  });

  it("saves again to the same article rather than creating another", async () => {
    const user = userEvent.setup();
    createArticle.mockResolvedValue({ id: "new-42", title: "Untitled" });

    renderWrite();
    await waitFor(() => expect(titleBox()).toHaveValue("Untitled"));

    await saveDraft(user);
    await waitFor(() => expect(createArticle).toHaveBeenCalledTimes(1));

    await saveDraft(user);
    await waitFor(() => expect(updateArticle).toHaveBeenCalled());

    expect(createArticle).toHaveBeenCalledTimes(1);
  });
});
