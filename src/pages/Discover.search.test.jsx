import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

/**
 * Search on the Discover page: the URL drives the query, each state renders,
 * and results link to the real destinations.
 */

const searchAll = vi.fn();
// Implementations are re-applied in beforeEach: the suite runs with
// `restoreMocks`, which clears them after every test.
const refreshDiscover = vi.fn();
const refreshCollections = vi.fn();

vi.mock("../utils/searchStore", async () => {
  const actual = await vi.importActual("../utils/searchStore");
  return { ...actual, searchAll: (...args) => searchAll(...args) };
});

vi.mock("../utils/discoverStore", () => ({
  refreshDiscover: () => refreshDiscover(),
  getDiscoverArticles: () => [],
  isDiscoverLoaded: () => true,
  subscribeDiscover: () => () => {},
}));

vi.mock("../utils/collectionsStore", () => ({
  getState: () => ({ bookmarks: [], collections: [] }),
  toggleBookmark: vi.fn(),
  subscribeCollections: () => () => {},
  refreshCollections: () => refreshCollections(),
}));

const { Discover } = await import("./Discover");

const ARTICLE = {
  id: "6a646e52e31f34264a01f56e",
  title: "Designing Resilient Systems",
  description: "On failure domains",
  author: "Alex Rivera",
  date: "Dec 4, 2025",
  readingTime: "6 min read",
  status: "Published",
  img: "/cover.png",
};

const COLLECTION = { id: "c1", name: "Design reading", description: "Saved pieces" };
const PERSON = { id: "u1", name: "Dana Designer", username: "dana", role: "Design Lead" };

/** Reports the current URL so navigation can be asserted. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LocationProbe />
      <Routes>
        <Route path="/dashboard/discover" element={<Discover />} />
        <Route path="/article/:id" element={<div>Reader page</div>} />
        <Route path="/author/:identifier" element={<div>Author page</div>} />
        <Route path="/dashboard/collections" element={<div>Collections page</div>} />
      </Routes>
    </MemoryRouter>,
  );

const allResults = {
  query: "design",
  articles: [ARTICLE],
  collections: [COLLECTION],
  people: [PERSON],
  total: 3,
  partial: false,
};

beforeEach(() => {
  searchAll.mockReset();
  refreshDiscover.mockReset().mockResolvedValue([]);
  refreshCollections.mockReset().mockResolvedValue(undefined);
});

describe("Discover — no query", () => {
  it("shows the normal browse feed and issues no search", async () => {
    renderAt("/dashboard/discover");

    await waitFor(() => expect(screen.getByText("Discover")).toBeInTheDocument());
    expect(searchAll).not.toHaveBeenCalled();
    expect(screen.queryByText(/Results for/)).not.toBeInTheDocument();
  });
});

describe("Discover — search states", () => {
  it("shows a loading state, and no empty results layout, while the request is in flight", async () => {
    searchAll.mockReturnValue(new Promise(() => {}));

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(/Searching for/)).toBeInTheDocument());
    expect(screen.queryByText(/No results for/)).not.toBeInTheDocument();
  });

  it("renders grouped results for a query in the URL", async () => {
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    expect(screen.getByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
    expect(screen.getByText(COLLECTION.name)).toBeInTheDocument();
    expect(screen.getByText(PERSON.name)).toBeInTheDocument();
  });

  it("reproduces the same results when the URL is opened directly — a shared link", async () => {
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    expect(searchAll).toHaveBeenCalledWith("design", expect.anything());
    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/discover?q=design");
  });

  it("shows an empty state when nothing matches", async () => {
    searchAll.mockResolvedValue({ query: "zzz", articles: [], collections: [], people: [], total: 0 });

    renderAt("/dashboard/discover?q=zzz");

    await waitFor(() => expect(screen.getByText(/No results for/)).toBeInTheDocument());
  });

  it("shows an error state with a retry when the search API fails", async () => {
    searchAll.mockRejectedValue(new Error("search is down"));

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText("Search is unavailable right now")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("re-runs the search when retry is pressed", async () => {
    const user = userEvent.setup();
    searchAll.mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText("Search is unavailable right now")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    expect(searchAll).toHaveBeenCalledTimes(2);
  });
});

describe("Discover — clearing the search", () => {
  it("removes the q parameter and returns to the browse feed", async () => {
    const user = userEvent.setup();
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /clear search/i }));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/discover"),
    );
    expect(screen.getByTestId("location").textContent).not.toContain("q=");
    expect(screen.queryByText(/Results for/)).not.toBeInTheDocument();
  });
});

describe("Discover — result destinations", () => {
  it("an article result opens the public reader", async () => {
    const user = userEvent.setup();
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    await user.click(screen.getByText(ARTICLE.title));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(`/article/${ARTICLE.id}`),
    );
    expect(screen.getByText("Reader page")).toBeInTheDocument();
  });

  it("a person result opens the public author page, never the editor", async () => {
    const user = userEvent.setup();
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(PERSON.name)).toBeInTheDocument());
    await user.click(screen.getByText(PERSON.name));

    await waitFor(() => expect(screen.getByText("Author page")).toBeInTheDocument());
    expect(screen.getByTestId("location")).toHaveTextContent("/author/dana");
    expect(screen.getByTestId("location").textContent).not.toContain("/dashboard/write");
  });

  it("a collection result opens that collection", async () => {
    const user = userEvent.setup();
    searchAll.mockResolvedValue(allResults);

    renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(COLLECTION.name)).toBeInTheDocument());
    await user.click(screen.getByText(COLLECTION.name));

    await waitFor(() => expect(screen.getByText("Collections page")).toBeInTheDocument());
    expect(screen.getByTestId("location")).toHaveTextContent("collection=c1");
  });

  it("no result ever links to the editor", async () => {
    searchAll.mockResolvedValue(allResults);

    const { container } = renderAt("/dashboard/discover?q=design");

    await waitFor(() => expect(screen.getByText(ARTICLE.title)).toBeInTheDocument());
    expect(container.innerHTML).not.toContain("/dashboard/write");
  });
});
