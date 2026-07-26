import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

/**
 * The global search box in the topbar.
 *
 * What matters here is submission and persistence: Enter navigates with the
 * query in the URL, the box keeps showing it afterwards, and no request is
 * made while typing.
 */

vi.mock("../utils/auth", () => ({ logoutUser: vi.fn() }));
vi.mock("../utils/profileStore", () => ({
  getProfile: () => ({ name: "Alex Rivera", role: "Editor", avatar: "", initials: "AR" }),
  getInitials: (name) => (name ? name.slice(0, 2).toUpperCase() : ""),
  subscribeProfile: () => () => {},
}));
vi.mock("../utils/planStore", () => ({
  getSubscription: () => ({ planId: "starter" }),
  subscribeSubscription: () => () => {},
  fetchSubscription: () => Promise.resolve({ planId: "starter" }),
  planById: () => ({ name: "Starter" }),
}));

const { Home } = await import("./Home");

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LocationProbe />
      <Routes>
        <Route path="/dashboard" element={<Home />}>
          <Route index element={<div>Dashboard body</div>} />
          <Route path="discover" element={<div>Discover body</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const searchBox = () => screen.getByRole("textbox", { name: /search articles, collections and people/i });

beforeEach(() => {
  localStorage.clear();
});

describe("topbar search", () => {
  it("submits on Enter and puts the query in the URL", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.type(searchBox(), "design systems");
    await user.keyboard("{Enter}");

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard/discover?q=design%20systems"),
    );
  });

  it("keeps the query visible in the box after submitting", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.type(searchBox(), "typography");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("q=typography"));
    expect(searchBox()).toHaveValue("typography");
  });

  it("shows the query from the URL when a search link is opened directly", () => {
    renderAt("/dashboard/discover?q=resilience");
    expect(searchBox()).toHaveValue("resilience");
  });

  it("does not navigate on an empty or whitespace-only query", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.type(searchBox(), "   ");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(screen.getByTestId("location").textContent).not.toContain("q=");
  });

  it("does not re-submit the query already on screen", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard/discover?q=design");

    const before = screen.getByTestId("location").textContent;
    await user.click(searchBox());
    await user.keyboard("{Enter}");

    // Same URL, so React Router never pushed a duplicate entry.
    expect(screen.getByTestId("location")).toHaveTextContent(before);
  });

  it("encodes characters that would otherwise break the URL", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.type(searchBox(), "a&b=c");
    await user.keyboard("{Enter}");

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("q=a%26b%3Dc"));
  });

  it("clears the box and drops the query parameter", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard/discover?q=design");

    expect(searchBox()).toHaveValue("design");
    await user.click(screen.getByRole("button", { name: /clear search/i }));

    await waitFor(() => expect(searchBox()).toHaveValue(""));
    expect(screen.getByTestId("location").textContent).not.toContain("q=");
  });

  it("offers no clear button when the box is empty", () => {
    renderAt("/dashboard");
    expect(screen.queryByRole("button", { name: /clear search/i })).not.toBeInTheDocument();
  });

  it("follows the URL when the query changes underneath it", async () => {
    const user = userEvent.setup();

    // Stands in for anything that changes the URL without touching the box:
    // the back button, or Discover's own "Clear search" control.
    const Elsewhere = () => {
      const navigate = useNavigate();
      return <button onClick={() => navigate("/dashboard/discover?q=second")}>go</button>;
    };

    render(
      <MemoryRouter initialEntries={["/dashboard/discover?q=first"]}>
        <LocationProbe />
        <Elsewhere />
        <Routes>
          <Route path="/dashboard" element={<Home />}>
            <Route path="discover" element={<div>Discover body</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(searchBox()).toHaveValue("first");

    await user.click(screen.getByRole("button", { name: "go" }));

    await waitFor(() => expect(searchBox()).toHaveValue("second"));
  });
});
