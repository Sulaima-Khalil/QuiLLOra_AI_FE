import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter } from "react-router-dom";

/**
 * Start-up sequencing.
 *
 * The guarantee under test is that no route — and therefore no guard — renders
 * while the cookie session is still being checked. If the router mounted
 * during that window, a signed-in user reloading /dashboard would be bounced
 * to /login before `restoreSession()` had a chance to answer.
 */

const restoreSession = vi.fn();

vi.mock("./utils/auth", () => ({ restoreSession: () => restoreSession() }));

// A stand-in router: rendering it at all is the signal we assert on.
vi.mock("./Routes/index", () => ({
  default: createMemoryRouter([{ path: "*", element: <div>ROUTES MOUNTED</div> }]),
}));

const loadApp = async () => (await import("./App")).default;

describe("App start-up", () => {
  beforeEach(() => {
    vi.resetModules();
    restoreSession.mockReset();
  });

  it("shows the loader and mounts no route while the session check is in flight", async () => {
    let finish;
    restoreSession.mockReturnValue(new Promise((resolve) => { finish = resolve; }));

    const App = await loadApp();
    render(<App />);

    // Mid-flight: loader visible, router absent, so nothing can redirect.
    expect(screen.getByText("Loading your workspace…")).toBeInTheDocument();
    expect(screen.queryByText("ROUTES MOUNTED")).not.toBeInTheDocument();

    finish(null);

    await waitFor(() => expect(screen.getByText("ROUTES MOUNTED")).toBeInTheDocument());
    expect(screen.queryByText("Loading your workspace…")).not.toBeInTheDocument();
  });

  it("never shows a blank screen — the loader is on screen from the first paint", async () => {
    restoreSession.mockReturnValue(new Promise(() => {}));

    const App = await loadApp();
    const { container } = render(<App />);

    expect(container).not.toBeEmptyDOMElement();

    /*
     * Asserted as a status region rather than as a progressbar.
     *
     * The spinner used to be the only thing in the accessibility tree here,
     * and MUI's CircularProgress carries no name — so a screen reader
     * announced "progress bar" and nothing about what was happening, while
     * the "Loading your workspace…" text went unannounced entirely. The
     * spinner is now decorative and the message carries the semantics, which
     * is a stronger version of what this test is here to protect: that the
     * first paint is never an unexplained blank screen.
     */
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Loading your workspace…");
  });

  it("mounts the routes once the session check resolves, signed in or out", async () => {
    restoreSession.mockResolvedValue(null);

    const App = await loadApp();
    render(<App />);

    await waitFor(() => expect(screen.getByText("ROUTES MOUNTED")).toBeInTheDocument());
  });

  it("falls back to a retryable error state if the bootstrap itself rejects", async () => {
    restoreSession.mockRejectedValue(new Error("bootstrap exploded"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const App = await loadApp();
    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("We couldn't start your session")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText("ROUTES MOUNTED")).not.toBeInTheDocument();

    consoleError.mockRestore();
  });
});
