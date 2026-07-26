import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/**
 * The AI Writer end to end.
 *
 * Nothing on this page may look like AI output unless the server produced it:
 * the canvas starts empty, generation goes to the real API, the real response
 * populates the editor, and saving goes through the real article API.
 */

let articleList = [];
let quota = { limit: 5, usage: 1, remaining: 4, enforced: true, reached: false };

const generateArticle = vi.fn();
const generateParagraph = vi.fn();
const createArticle = vi.fn();
const updateArticle = vi.fn();
const fetchEntitlements = vi.fn();

vi.mock("../utils/aiStore", () => ({
  generateArticle: (...a) => generateArticle(...a),
  generateParagraph: (...a) => generateParagraph(...a),
  generateInsights: () => Promise.resolve(null),
  fetchAiOptions: () => Promise.resolve(null),
}));

vi.mock("../utils/articlesStore", () => ({
  createArticle: (...a) => createArticle(...a),
  updateArticle: (...a) => updateArticle(...a),
  getArticles: () => articleList,
  refreshArticles: () => Promise.resolve(articleList),
  subscribeArticles: () => () => {},
}));

vi.mock("../utils/entitlementsStore", () => ({
  capability: () => quota,
  fetchEntitlements: () => fetchEntitlements(),
  subscribeEntitlements: () => () => {},
}));

vi.mock("../utils/profileStore", () => ({
  getProfile: () => ({ name: "Alex Rivera", avatar: "" }),
  getInitials: (n) => (n ? n.slice(0, 2).toUpperCase() : ""),
}));

const AIWriter = (await import("./AIWriter")).default;

/** What POST /ai/generate really returns, mapped by aiStore. */
const SERVER_RESULT = {
  title: "An Analysis of Distributed Systems",
  html: "<p>Server-composed opening paragraph.</p><p>And a second.</p>",
  content: "<p>Server-composed opening paragraph.</p><p>And a second.</p>",
  excerpt: "Server-composed opening paragraph.",
  wordCount: 9,
  readTime: 1,
  readingEase: 62,
};

const LIMIT_REJECTION = {
  response: {
    status: 403,
    data: {
      success: false,
      code: "PLAN_LIMIT_REACHED",
      message: "The Starter plan includes 5 AI generations per day. Your allowance resets at midnight UTC.",
    },
  },
};

const renderWriter = () => render(<MemoryRouter><AIWriter /></MemoryRouter>);

/** The topbar control that opens the intake panel. */
const openIntake = (user) => user.click(screen.getByRole("button", { name: /new ai draft/i }));

/** The topbar save control, labelled "Saved" (or "Saving…" mid-write). */
const saveButton = () => screen.getByRole("button", { name: /^saved|saving/i });

const enterTopicAndGenerate = async (user, topic = "distributed systems") => {
  await openIntake(user);
  const field = await screen.findByLabelText(/what should this article be about/i);
  await user.clear(field);
  await user.type(field, topic);
  await user.click(screen.getByRole("button", { name: /generate article/i }));
};

/**
 * Waits for the intake dialog to close.
 *
 * It is a portal and marks the rest of the app `aria-hidden`, so the topbar
 * controls are unreachable by role until it has gone. It closes only on a
 * successful generation — a failure leaves it open with the prompt intact.
 */
const waitForIntakeClosed = () =>
  waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

beforeEach(() => {
  articleList = [];
  quota = { limit: 5, usage: 1, remaining: 4, enforced: true, reached: false };
  generateArticle.mockReset().mockResolvedValue(SERVER_RESULT);
  generateParagraph.mockReset().mockResolvedValue({ html: "<p>Extra.</p>" });
  createArticle.mockReset().mockResolvedValue({ id: "art-1", title: SERVER_RESULT.title });
  updateArticle.mockReset().mockResolvedValue({ id: "art-1" });
  fetchEntitlements.mockReset().mockResolvedValue(null);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AI Writer — no demo content", () => {
  it("opens with an empty canvas, not a sample draft", async () => {
    const { container } = renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    expect(container.textContent).not.toContain("neural prose that breathes");
    expect(container.textContent).not.toContain("The Future of Neural Prose");
    expect(container.textContent).not.toContain("The machine does not replace the writer");
  });

  it("gives a new document the next free default title", async () => {
    articleList = [{ title: "Untitled" }, { title: "Untitled 2" }];
    renderWriter();

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/untitled document/i)).toHaveValue("Untitled 3"),
    );
  });

  it("shows no fabricated version history", async () => {
    const { container } = renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    expect(container.textContent).not.toContain("v2.3");
    expect(container.textContent).not.toContain("Tone Adjustment");
    expect(container.textContent).not.toContain("by AI Assistant");
  });
});

describe("AI Writer — real generation", () => {
  it("sends the topic and options to the real API", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);

    await waitFor(() =>
      expect(generateArticle).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: "distributed systems",
          tone: "Academic",
          length: "Medium",
          category: "General",
        }),
      ),
    );
  });

  it("puts the server's title and body into the editor", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);

    await waitFor(() =>
      expect(screen.getByPlaceholderText(/untitled document/i)).toHaveValue(SERVER_RESULT.title),
    );
  });

  it("discards nothing — the generated body reaches the canvas", async () => {
    const user = userEvent.setup();
    const { container } = renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);

    await waitFor(() => expect(container.textContent).toContain("Server-composed opening paragraph"));
  });

  it("refreshes the AI allowance after a successful generation", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    const before = fetchEntitlements.mock.calls.length;

    await enterTopicAndGenerate(user);

    await waitFor(() => expect(fetchEntitlements.mock.calls.length).toBeGreaterThan(before));
  });

  it("does not publish generated content automatically", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);
    await waitFor(() => expect(generateArticle).toHaveBeenCalled());

    // Generation writes nothing to the article API at all.
    expect(createArticle).not.toHaveBeenCalled();
    expect(updateArticle).not.toHaveBeenCalled();
  });
});

describe("AI Writer — duplicate submissions", () => {
  it("does not fire a second request while one is in flight", async () => {
    const user = userEvent.setup();
    let release;
    generateArticle.mockImplementation(
      () => new Promise((resolve) => { release = () => resolve(SERVER_RESULT); }),
    );

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await openIntake(user);
    const field = await screen.findByLabelText(/what should this article be about/i);
    await user.type(field, "distributed systems");

    const button = screen.getByRole("button", { name: /generate article/i });
    await user.click(button);

    // The control disables itself for the duration, so a second click cannot
    // reach it — which is exactly the guarantee under test.
    await waitFor(() => expect(button).toBeDisabled());
    expect(generateArticle).toHaveBeenCalledTimes(1);

    release();
    await waitFor(() => expect(generateArticle).toHaveBeenCalledTimes(1));
  });

  it("shows a real loading state while generating", async () => {
    const user = userEvent.setup();
    generateArticle.mockImplementation(() => new Promise(() => {}));

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await enterTopicAndGenerate(user);

    await waitFor(() => expect(screen.getAllByText(/generating/i).length).toBeGreaterThan(0));
  });
});

describe("AI Writer — failure handling", () => {
  it("keeps the topic and options when the API fails", async () => {
    const user = userEvent.setup();
    generateArticle.mockRejectedValue({ response: { data: { message: "Generation failed." } } });

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await enterTopicAndGenerate(user, "quantum ethics");

    await waitFor(() => expect(screen.getByText(/Generation failed/i)).toBeInTheDocument());

    // The intake stays open with the prompt intact, ready to retry.
    expect(screen.getByLabelText(/what should this article be about/i)).toHaveValue("quantum ethics");
  });

  it("does not put fake content in the editor after a failure", async () => {
    const user = userEvent.setup();
    generateArticle.mockRejectedValue({ response: { data: { message: "Generation failed." } } });

    const { container } = renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await enterTopicAndGenerate(user);

    await waitFor(() => expect(screen.getByText(/Generation failed/i)).toBeInTheDocument());
    expect(container.textContent).not.toContain("Server-composed opening paragraph");
  });

  it("shows the plan-limit message from the server", async () => {
    const user = userEvent.setup();
    generateArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    await enterTopicAndGenerate(user);

    await waitFor(() =>
      expect(screen.getByText(/5 AI generations per day/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/PLAN_LIMIT_REACHED/)).not.toBeInTheDocument();
  });

  it("re-reads the allowance after a limit rejection", async () => {
    const user = userEvent.setup();
    generateArticle.mockRejectedValue(LIMIT_REJECTION);

    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());
    const before = fetchEntitlements.mock.calls.length;

    await enterTopicAndGenerate(user);

    await waitFor(() => expect(fetchEntitlements.mock.calls.length).toBeGreaterThan(before));
  });
});

describe("AI Writer — saving generated content", () => {
  it("saves through the real article API as a draft", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);
    await waitForIntakeClosed();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/untitled document/i)).toHaveValue(SERVER_RESULT.title),
    );

    await user.click(saveButton());

    await waitFor(() =>
      expect(createArticle).toHaveBeenCalledWith(
        expect.objectContaining({ title: SERVER_RESULT.title, status: "Draft", generatedByAI: true }),
      ),
    );
  });

  it("updates the same article on a second save instead of duplicating it", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);
    await waitForIntakeClosed();
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/untitled document/i)).toHaveValue(SERVER_RESULT.title),
    );

    await user.click(saveButton());
    await waitFor(() => expect(createArticle).toHaveBeenCalledTimes(1));

    await user.click(saveButton());
    await waitFor(() => expect(updateArticle).toHaveBeenCalled());

    expect(createArticle).toHaveBeenCalledTimes(1);
  });
});

describe("AI Writer — not destroying the author's work", () => {
  it("asks before replacing a canvas that already has content", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    // First generation on an empty canvas: no prompt.
    await enterTopicAndGenerate(user);
    await waitForIntakeClosed();
    expect(generateArticle).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();

    // Second: the canvas now holds work, so it must ask.
    await enterTopicAndGenerate(user, "another topic");
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
  });

  it("does not generate when the author declines the replacement", async () => {
    const user = userEvent.setup();
    renderWriter();
    await waitFor(() => expect(fetchEntitlements).toHaveBeenCalled());

    await enterTopicAndGenerate(user);
    await waitForIntakeClosed();
    expect(generateArticle).toHaveBeenCalledTimes(1);

    window.confirm.mockReturnValue(false);
    await enterTopicAndGenerate(user, "another topic");

    // Still one call: the existing draft was left alone.
    expect(generateArticle).toHaveBeenCalledTimes(1);
  });
});
