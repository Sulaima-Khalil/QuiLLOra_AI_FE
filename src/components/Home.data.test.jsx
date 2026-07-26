import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

/**
 * The dashboard shell's data integrity: the sidebar count is the author's real
 * article total, and neither the notification panel nor the AI widget presents
 * invented numbers as data.
 */

const refreshSummary = vi.fn();
let summarySnapshot = null;
let summaryListener = null;

vi.mock("../utils/auth", () => ({ logoutUser: vi.fn() }));
vi.mock("../utils/profileStore", () => ({
  getProfile: () => ({ name: "Alex Rivera", role: "Editor", avatar: "", initials: "AR" }),
  getInitials: (name) => (name ? name.slice(0, 2).toUpperCase() : ""),
  subscribeProfile: () => () => {},
}));
vi.mock("../utils/planStore", () => ({
  getSubscription: () => ({ planId: "pro" }),
  subscribeSubscription: () => () => {},
  fetchSubscription: () => Promise.resolve({ planId: "pro" }),
  planById: () => ({ name: "Pro" }),
}));
vi.mock("../utils/analyticsStore", () => ({
  getSummary: () => summarySnapshot,
  refreshSummary: () => refreshSummary(),
  subscribeSummary: (cb) => {
    summaryListener = cb;
    return () => { summaryListener = null; };
  },
}));

const { Home } = await import("./Home");

const renderShell = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard" element={<Home />}>
          <Route index element={<div>Dashboard body</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  summarySnapshot = null;
  summaryListener = null;
  refreshSummary.mockReset().mockResolvedValue(undefined);
});

describe("sidebar article count", () => {
  it("no longer shows the hardcoded 128", async () => {
    summarySnapshot = { totalArticles: 6, published: 3 };
    const { container } = renderShell();

    await waitFor(() => expect(screen.getAllByText("My Articles").length).toBeGreaterThan(0));
    expect(container.textContent).not.toContain("128");
  });

  it("shows the author's real total", async () => {
    summarySnapshot = { totalArticles: 6, published: 3 };
    renderShell();

    await waitFor(() => expect(screen.getAllByText("6").length).toBeGreaterThan(0));
  });

  it("omits the count entirely until the totals load, rather than showing a zero", async () => {
    summarySnapshot = null;
    const { container } = renderShell();

    await waitFor(() => expect(screen.getAllByText("My Articles").length).toBeGreaterThan(0));

    const sidebarText = container.textContent;
    expect(sidebarText).not.toContain("128");
    // Then the real number arrives.
    act(() => summaryListener({ totalArticles: 4 }));
    await waitFor(() => expect(screen.getAllByText("4").length).toBeGreaterThan(0));
  });

  it("requests the totals once for the whole shell", async () => {
    renderShell();
    await waitFor(() => expect(refreshSummary).toHaveBeenCalledTimes(1));
  });
});

describe("notifications", () => {
  it("presents no invented notification events", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    await waitFor(() =>
      expect(screen.getByText(/Notifications aren't available yet/)).toBeInTheDocument(),
    );

    for (const invented of [
      "Ava Collins commented on your draft",
      "hit 10K views",
      "Sarah Chen invited you to collaborate",
    ]) {
      expect(screen.queryByText(invented)).not.toBeInTheDocument();
    }
  });

  it("offers no 'Mark all read' for notifications that do not exist", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    await waitFor(() =>
      expect(screen.getByText(/Notifications aren't available yet/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/mark all read/i)).not.toBeInTheDocument();
  });

  it("writes no read-state to localStorage", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(localStorage.getItem("quillora_notifications_read")).toBeNull();
  });
});

describe("AI usage widget", () => {
  it("shows no invented credit balance or progress", async () => {
    const { container } = renderShell();

    await waitFor(() => expect(screen.getAllByText("AI USAGE").length).toBeGreaterThan(0));

    expect(container.textContent).not.toContain("2,450");
    expect(container.textContent).not.toContain("AI CREDITS");
    expect(container.querySelector(".MuiLinearProgress-root")).toBeNull();
  });

  it("states plainly that usage tracking is unavailable, alongside the real plan", async () => {
    renderShell();

    await waitFor(() =>
      expect(screen.getAllByText(/Usage tracking isn't available yet/).length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
  });
});
