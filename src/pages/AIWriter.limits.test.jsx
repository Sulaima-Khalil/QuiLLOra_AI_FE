import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/**
 * The AI Writer against the daily allowance.
 *
 * What matters: the remaining count shown is the server's, a spent day is
 * stated plainly, and nothing here invents a credit balance the way the old
 * sidebar widget did.
 */

let quota = null;

const generateArticle = vi.fn();
const generateParagraph = vi.fn();
const fetchEntitlements = vi.fn();

vi.mock("../utils/entitlementsStore", () => ({
  capability: () => quota,
  fetchEntitlements: () => fetchEntitlements(),
  subscribeEntitlements: () => () => {},
}));

vi.mock("../utils/aiStore", () => ({
  generateArticle: (...a) => generateArticle(...a),
  generateParagraph: (...a) => generateParagraph(...a),
  generateInsights: () => Promise.resolve(null),
  fetchAiOptions: () => Promise.resolve(null),
}));

vi.mock("../utils/articlesStore", () => ({
  createArticle: () => Promise.resolve({ id: "a1" }),
  updateArticle: () => Promise.resolve({ id: "a1" }),
  // The page now derives its default title from the author's real articles.
  getArticles: () => [],
  refreshArticles: () => Promise.resolve([]),
  subscribeArticles: () => () => {},
}));

const AIWriter = (await import("./AIWriter")).default;

const HEADROOM = { limit: 5, usage: 2, remaining: 3, enforced: true, reached: false };
const SPENT = { limit: 5, usage: 5, remaining: 0, enforced: true, reached: true };
const UNLIMITED = { limit: null, usage: 12, remaining: null, enforced: true, reached: false };

const LIMIT_REJECTION = {
  response: {
    status: 403,
    data: {
      success: false,
      code: "PLAN_LIMIT_REACHED",
      message:
        "The Starter plan includes 5 AI generations per day. Your allowance resets at midnight UTC, or upgrade for unlimited generations.",
    },
  },
};

const renderWriter = () => render(<MemoryRouter><AIWriter /></MemoryRouter>);

/** Opens the intake dialog where the allowance is shown. */
const openIntake = async (user) => {
  const trigger = screen.getAllByRole("button", { name: /generate|new draft|ai/i })[0];
  await user.click(trigger);
};

beforeEach(() => {
  quota = null;
  generateArticle.mockReset();
  generateParagraph.mockReset();
  fetchEntitlements.mockReset().mockResolvedValue(null);
});

describe("AI Writer — usage display", () => {
  it("asks the server for the allowance on mount", async () => {
    quota = HEADROOM;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
  });

  it("shows the real remaining count from the server", async () => {
    const user = userEvent.setup();
    quota = HEADROOM;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    await waitFor(() =>
      expect(screen.getByText(/3 of 5 generations left today/i)).toBeInTheDocument(),
    );
  });

  it("shows no count at all on an unlimited plan", async () => {
    const user = userEvent.setup();
    quota = UNLIMITED;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    expect(screen.queryByText(/generations left today/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/limit reached/i)).not.toBeInTheDocument();
  });

  it("invents no number while the allowance is unknown", async () => {
    const user = userEvent.setup();
    quota = null;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    expect(screen.queryByText(/generations left today/i)).not.toBeInTheDocument();
  });

  it("shows no fabricated credit balance anywhere", async () => {
    quota = HEADROOM;
    const { container } = renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    expect(container.textContent).not.toContain("2,450");
    expect(container.textContent).not.toContain("AI CREDITS");
  });
});

describe("AI Writer — limit reached", () => {
  it("says the daily limit is reached", async () => {
    const user = userEvent.setup();
    quota = SPENT;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    await waitFor(() => expect(screen.getByText(/Daily AI limit reached/i)).toBeInTheDocument());
  });

  it("disables the generate action rather than letting it fail", async () => {
    const user = userEvent.setup();
    quota = SPENT;
    renderWriter();

    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    const generateButton = await screen.findByRole("button", { name: /generate article/i });
    expect(generateButton).toBeDisabled();
    expect(generateArticle).not.toHaveBeenCalled();
  });
});

describe("AI Writer — server refusal", () => {
  it("shows the server's message and claims no success", async () => {
    const user = userEvent.setup();
    // The client believes there is room; the server disagrees.
    quota = HEADROOM;
    generateArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await openIntake(user);

    const topic = await screen.findByLabelText(/what should this article be about/i);
    await user.type(topic, "neural prose");
    await user.click(screen.getByRole("button", { name: /generate article/i }));

    await waitFor(() =>
      expect(screen.getByText(/5 AI generations per day/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/resets at midnight UTC/i)).toBeInTheDocument();
    expect(screen.queryByText(/PLAN_LIMIT_REACHED/)).not.toBeInTheDocument();
  });

  it("re-reads the allowance after a refusal", async () => {
    const user = userEvent.setup();
    quota = HEADROOM;
    generateArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    const callsBefore = fetchEntitlements.mock.calls.length;

    await openIntake(user);
    const topic = await screen.findByLabelText(/what should this article be about/i);
    await user.type(topic, "neural prose");
    await user.click(screen.getByRole("button", { name: /generate article/i }));

    await waitFor(() =>
      expect(fetchEntitlements.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });

  it("re-reads the allowance after a successful generation", async () => {
    const user = userEvent.setup();
    quota = HEADROOM;
    generateArticle.mockResolvedValue({
      title: "A Draft",
      html: "<p>Body</p>",
      content: "<p>Body</p>",
      wordCount: 2,
    });

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    const callsBefore = fetchEntitlements.mock.calls.length;

    await openIntake(user);
    const topic = await screen.findByLabelText(/what should this article be about/i);
    await user.type(topic, "neural prose");
    await user.click(screen.getByRole("button", { name: /generate article/i }));

    await waitFor(() => expect(generateArticle).toHaveBeenCalled());
    await waitFor(() =>
      expect(fetchEntitlements.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });
});
