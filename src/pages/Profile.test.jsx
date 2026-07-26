import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/**
 * Profile data integrity and freshness.
 *
 * Two things are under test: that the stat row shows the author's real totals
 * rather than the invented "2.4M reads / 88% engagement / Top 1%", and that
 * the page follows the profile store instead of a snapshot taken at mount.
 */

let profileSnapshot = { name: "Alex Rivera", role: "Editor", avatar: "", bio: "" };
let profileListener = null;

const fetchProfile = vi.fn();
const saveProfile = vi.fn();
const refreshArticles = vi.fn();
const refreshSummary = vi.fn();

let summarySnapshot = null;
let summaryListener = null;
let articlesSnapshot = [];

vi.mock("../utils/profileStore", () => ({
  getProfile: () => profileSnapshot,
  getInitials: (name) => (name ? name.slice(0, 2).toUpperCase() : ""),
  saveProfile: (...args) => saveProfile(...args),
  fetchProfile: () => fetchProfile(),
  subscribeProfile: (cb) => {
    profileListener = cb;
    return () => { profileListener = null; };
  },
}));

vi.mock("../utils/articlesStore", () => ({
  getArticles: () => articlesSnapshot,
  refreshArticles: () => refreshArticles(),
  subscribeArticles: () => () => {},
}));

vi.mock("../utils/analyticsStore", () => ({
  getSummary: () => summarySnapshot,
  refreshSummary: () => refreshSummary(),
  subscribeSummary: (cb) => {
    summaryListener = cb;
    return () => { summaryListener = null; };
  },
}));

const { Profile } = await import("./Profile");

const SUMMARY = {
  totalArticles: 6,
  published: 3,
  totalViews: 1280,
  totalWords: 9400,
  totalReadTime: 47,
};

const renderProfile = () => render(<MemoryRouter><Profile /></MemoryRouter>);

beforeEach(() => {
  profileSnapshot = { name: "Alex Rivera", role: "Editor", avatar: "", bio: "" };
  articlesSnapshot = [];
  summarySnapshot = null;
  profileListener = null;
  summaryListener = null;
  fetchProfile.mockReset().mockResolvedValue(profileSnapshot);
  saveProfile.mockReset().mockResolvedValue(profileSnapshot);
  refreshArticles.mockReset().mockResolvedValue([]);
  refreshSummary.mockReset().mockResolvedValue(SUMMARY);
});

describe("Profile — real statistics", () => {
  it("shows no invented reach figures", async () => {
    summarySnapshot = SUMMARY;
    const { container } = renderProfile();

    await waitFor(() => expect(screen.getByText("Alex Rivera")).toBeInTheDocument());

    for (const invented of ["2.4M", "88%", "Top 1%"]) {
      expect(container.textContent).not.toContain(invented);
    }
  });

  it("renders the author's real totals from the summary", async () => {
    summarySnapshot = SUMMARY;
    renderProfile();

    await waitFor(() => expect(screen.getByText("TOTAL READS")).toBeInTheDocument());

    expect(screen.getByText("1,280")).toBeInTheDocument();  // totalViews
    expect(screen.getByText("6")).toBeInTheDocument();      // totalArticles
    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
    expect(screen.getByText("TOTAL WORDS")).toBeInTheDocument();
  });

  it("shows a placeholder rather than a zero before the totals arrive", async () => {
    summarySnapshot = null;
    renderProfile();

    await waitFor(() => expect(screen.getByText("TOTAL READS")).toBeInTheDocument());
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("requests the profile, articles and summary on mount", async () => {
    renderProfile();

    await waitFor(() => expect(fetchProfile).toHaveBeenCalled());
    expect(refreshArticles).toHaveBeenCalled();
    expect(refreshSummary).toHaveBeenCalled();
  });
});

describe("Profile — freshness", () => {
  it("re-renders when the profile store changes elsewhere, e.g. from Settings", async () => {
    renderProfile();

    await waitFor(() => expect(screen.getByText("Alex Rivera")).toBeInTheDocument());

    // Settings saves a new name; the store notifies its subscribers.
    act(() => profileListener({ ...profileSnapshot, name: "Alexandra Rivera", role: "Lead Editor" }));

    await waitFor(() => expect(screen.getByText("Alexandra Rivera")).toBeInTheDocument());
    expect(screen.queryByText("Alex Rivera")).not.toBeInTheDocument();
  });

  it("picks up totals that arrive after mount", async () => {
    summarySnapshot = null;
    renderProfile();

    await waitFor(() => expect(screen.getByText("TOTAL READS")).toBeInTheDocument());

    act(() => summaryListener(SUMMARY));

    await waitFor(() => expect(screen.getByText("1,280")).toBeInTheDocument());
  });
});

describe("Profile — saving", () => {
  it("awaits the save instead of putting the promise into state", async () => {
    const user = userEvent.setup();
    summarySnapshot = SUMMARY;
    renderProfile();

    await waitFor(() => expect(screen.getByText("Alex Rivera")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    const nameField = screen.getByLabelText(/full name/i);
    await user.clear(nameField);
    await user.type(nameField, "New Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(saveProfile).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name" })));

    // The old code did `setProfile(saveProfile(draft))`, leaving a Promise in
    // state and blanking the header. The name must survive the save.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
  });

  it("surfaces a save failure instead of closing as if it worked", async () => {
    const user = userEvent.setup();
    summarySnapshot = SUMMARY;
    saveProfile.mockRejectedValue({ response: { data: { message: "Name is already taken" } } });

    renderProfile();
    await waitFor(() => expect(screen.getByText("Alex Rivera")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /edit profile/i }));
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(screen.getByText("Name is already taken")).toBeInTheDocument());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Profile — activity", () => {
  it("builds recent activity from real articles, not a fixed script", async () => {
    articlesSnapshot = [
      { id: "a1", title: "Designing Resilient Systems", status: "Published", date: "Dec 4, 2025", updatedAt: "2025-12-04T00:00:00Z", metrics: {} },
      { id: "a2", title: "Notes on Typography", status: "Draft", date: "Dec 1, 2025", updatedAt: "2025-12-01T00:00:00Z", metrics: {} },
    ];
    summarySnapshot = SUMMARY;

    const { container } = renderProfile();

    await waitFor(() => expect(screen.getByText("Recent Activity")).toBeInTheDocument());

    expect(container.textContent).toContain("Designing Resilient Systems");
    expect(container.textContent).toContain("Notes on Typography");
    // The invented entries are gone.
    expect(container.textContent).not.toContain("Won Editor of the Month");
    expect(container.textContent).not.toContain("The Future of Neural Prose");
  });

  it("shows an empty state when the author has no articles", async () => {
    articlesSnapshot = [];
    summarySnapshot = SUMMARY;

    renderProfile();

    await waitFor(() =>
      expect(screen.getByText(/No activity yet/)).toBeInTheDocument(),
    );
  });
});
