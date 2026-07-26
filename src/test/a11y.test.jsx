import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { expectNoViolations } from "./axe";
import { muiTheme } from "../theme/muiTheme";

/**
 * Accessibility of the shared surfaces.
 *
 * Two kinds of check, deliberately mixed. axe catches the mechanical faults —
 * a control with no name, an aria attribute pointing at nothing — but it
 * cannot tell you whether a dialog gives focus back, or whether a card can be
 * opened without a mouse. Those are asserted as behaviour.
 *
 * No test here claims the application is accessible. Each one pins a specific
 * regression that was found and fixed.
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
vi.mock("../utils/analyticsStore", () => ({
  getSummary: () => ({ totalArticles: 4 }),
  refreshSummary: () => Promise.resolve(),
  subscribeSummary: () => () => {},
}));

const { Home } = await import("../components/Home");
const { ConfirmDialog } = await import("../components/shared/ConfirmDialog");
const { ArticleCard } = await import("../components/shared/ArticleCard");
const { FilterInput } = await import("../components/shared/FilterInput");
const AppLoading = (await import("../components/shared/AppLoading")).default;
const SkipLink = (await import("../components/shared/SkipLink")).default;

/** Everything renders under the real theme — the focus ring lives there. */
const withTheme = (ui) => <ThemeProvider theme={muiTheme}>{ui}</ThemeProvider>;

const renderShell = () =>
  render(
    withTheme(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Home />}>
            <Route index element={<h1>Dashboard</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    ),
  );

beforeEach(() => {
  localStorage.clear();
});

/* ===========================================================================
 * Skip navigation
 * ======================================================================== */

describe("Skip to main content", () => {
  it("is a link pointing at the main region", () => {
    render(withTheme(<SkipLink />));

    const link = screen.getByRole("link", { name: /skip to main content/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("is the first thing a keyboard user reaches in the dashboard", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.tab();

    expect(document.activeElement).toHaveTextContent(/skip to main content/i);
  });

  it("targets a main landmark that can actually receive focus", () => {
    renderShell();

    const main = document.getElementById("main-content");
    expect(main).not.toBeNull();
    expect(main.tagName).toBe("MAIN");
    // Without tabindex the browser scrolls but leaves focus behind, so the
    // next Tab returns to the navigation the user asked to skip.
    expect(main).toHaveAttribute("tabindex", "-1");
  });
});

/* ===========================================================================
 * Dashboard shell
 * ======================================================================== */

describe("Dashboard shell", () => {
  it("exposes banner, navigation and main landmarks", () => {
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /workspace/i })).toBeInTheDocument();
  });

  it("names every icon-only control in the topbar and sidebar", () => {
    renderShell();

    for (const name of [/notifications/i, /switch to (light|dark) mode/i, /sign out/i]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }

    // Two avatars link to the profile — sidebar footer and topbar. Both were
    // announcing as the user's initials ("AR, link") before being named.
    const profileLinks = screen.getAllByRole("link", { name: /your profile/i });
    expect(profileLinks.length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "AR" })).toBeNull();
  });

  it("says which mode the toggle will switch to, not just that it toggles", () => {
    renderShell();

    // "Toggle color mode" left a screen-reader user unable to tell which mode
    // they were currently in; the name now states the outcome either way.
    expect(screen.queryByRole("button", { name: /toggle color mode/i })).toBeNull();
    expect(screen.getByRole("button", { name: /switch to (light|dark) mode/i })).toBeInTheDocument();
  });

  it("marks the notifications trigger as controlling a collapsed panel", async () => {
    const user = userEvent.setup();
    renderShell();

    const trigger = screen.getByRole("button", { name: /notifications/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("presentation")).toBeInTheDocument();
  });

  it("gives the search box a name and a search landmark", () => {
    renderShell();

    expect(screen.getByRole("search", { name: /search the workspace/i })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /search articles, collections and people/i }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = renderShell();
    await expectNoViolations(container);
  });
});

/* ===========================================================================
 * Dialogs
 * ======================================================================== */

describe("ConfirmDialog", () => {
  const setup = (props = {}) =>
    render(
      withTheme(
        <ConfirmDialog
          open
          title="Delete this article?"
          description="This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {}}
          onClose={() => {}}
          {...props}
        />,
      ),
    );

  it("takes its accessible name from the dialog title", () => {
    setup();

    // MUI does not wire DialogTitle to the dialog automatically; before the
    // ids were passed this announced as an unnamed "dialog".
    expect(screen.getByRole("dialog", { name: /delete this article\?/i })).toBeInTheDocument();
  });

  it("describes itself with the body copy", () => {
    setup();

    const dialog = screen.getByRole("dialog");
    const describedBy = dialog.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy)).toHaveTextContent("This cannot be undone.");
  });

  it("reaches both actions from the keyboard", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    setup({ onConfirm });

    const confirm = screen.getByRole("button", { name: "Delete" });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    confirm.focus();
    await user.keyboard("{Enter}");

    expect(onConfirm).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    setup({ onClose });

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("moves focus into the dialog and returns it to the trigger on close", async () => {
    const user = userEvent.setup();

    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open</button>
          <ConfirmDialog
            open={open}
            title="Remove member?"
            description="They lose access immediately."
            onConfirm={() => {}}
            onClose={() => setOpen(false)}
          />
        </>
      );
    };

    render(withTheme(<Harness />));

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    // MUI's focus trap owns this; the assertion guards against someone
    // disabling it, not against a hand-rolled implementation.
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    expect(document.activeElement).toBe(trigger);
  });

  it("has no axe violations", async () => {
    const { baseElement } = setup();
    await expectNoViolations(baseElement);
  });
});

/* ===========================================================================
 * Article cards
 * ======================================================================== */

describe("ArticleCard", () => {
  const props = {
    img: "/cover.jpg",
    title: "Designing for calm",
    description: "A short piece.",
    author: "Alex Rivera",
    date: "Mar 3, 2026",
    readingTime: "4 min read",
    status: "Published",
  };

  it("offers exactly one keyboard route into the article", () => {
    render(withTheme(<ArticleCard {...props} onRead={() => {}} />));

    // The cover and the title were both focusable "links" for the same
    // destination, and the cover repeated the title as its alt text, so a
    // keyboard user hit two stops and heard the title twice.
    expect(screen.getAllByRole("button", { name: "Designing for calm" })).toHaveLength(1);
    expect(document.querySelectorAll('[role="link"]')).toHaveLength(0);
  });

  it("opens the article with Enter and with Space", async () => {
    const user = userEvent.setup();
    const onRead = vi.fn();
    render(withTheme(<ArticleCard {...props} onRead={onRead} />));

    const title = screen.getByRole("button", { name: "Designing for calm" });

    title.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    // Both come from the native button; no key handler is written by hand.
    expect(onRead).toHaveBeenCalledTimes(2);
  });

  it("leaves the cover image out of the accessibility tree", () => {
    render(withTheme(<ArticleCard {...props} onRead={() => {}} />));

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("says which article an overflow menu belongs to", async () => {
    const user = userEvent.setup();
    render(withTheme(<ArticleCard {...props} onEdit={() => {}} onDelete={() => {}} />));

    const trigger = screen.getByRole("button", { name: /more actions for designing for calm/i });
    await user.click(trigger);

    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
  });

  it("returns focus to the trigger when the menu closes", async () => {
    const user = userEvent.setup();
    render(withTheme(<ArticleCard {...props} onEdit={() => {}} />));

    const trigger = screen.getByRole("button", { name: /more actions/i });
    await user.click(trigger);
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");

    expect(document.activeElement).toBe(trigger);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      withTheme(<ArticleCard {...props} onRead={() => {}} onEdit={() => {}} />),
    );
    await expectNoViolations(container);
  });
});

/* ===========================================================================
 * Inputs and status
 * ======================================================================== */

describe("FilterInput", () => {
  it("has an accessible name even though its label is not on screen", () => {
    render(withTheme(<FilterInput value="" onChange={() => {}} placeholder="Filter articles..." />));

    // The placeholder cannot be the name: it disappears as soon as anyone
    // types, so the field would lose its name mid-edit.
    expect(screen.getByRole("textbox", { name: /filter articles/i })).toBeInTheDocument();
  });

  it("prefers an explicit label over the placeholder", () => {
    render(
      withTheme(
        <FilterInput value="" onChange={() => {}} placeholder="Filter…" label="Filter team members" />,
      ),
    );

    expect(screen.getByRole("textbox", { name: "Filter team members" })).toBeInTheDocument();
  });
});

describe("AppLoading", () => {
  it("announces itself as a status rather than rendering a silent screen", () => {
    render(withTheme(<AppLoading />));

    expect(screen.getByRole("status")).toHaveTextContent(/loading your workspace/i);
  });

  it("does not also announce a nameless progress bar", () => {
    render(withTheme(<AppLoading />));

    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("replaces the message rather than stacking a second one when slow", () => {
    render(withTheme(<AppLoading slow onRetry={() => {}} />));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/still connecting/i);
    expect(status).not.toHaveTextContent(/loading your workspace/i);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});

/* ===========================================================================
 * Theme-level guarantees
 * ======================================================================== */

describe("Theme", () => {
  it("restores a focus ring on ButtonBase, which MUI resets to outline: 0", () => {
    // The single most load-bearing fix in this pass: without it no Button,
    // IconButton, MenuItem or Tab in the app showed keyboard focus.
    const ring = muiTheme.components.MuiButtonBase.styleOverrides.root["&.Mui-focusVisible"];

    expect(ring.outline).toMatch(/2px solid/);
    expect(ring.outlineOffset).toBe("2px");
  });

  it("keeps placeholders fully opaque instead of MUI's dark-mode 0.5", () => {
    const placeholder =
      muiTheme.components.MuiInputBase.styleOverrides.input["&::placeholder"];

    expect(placeholder.opacity).toBe(1);
  });

  it("caps animation and transition duration under prefers-reduced-motion", () => {
    const reduced =
      muiTheme.components.MuiCssBaseline.styleOverrides["@media (prefers-reduced-motion: reduce)"];

    const rules = reduced["*, *::before, *::after"];
    expect(rules.animationDuration).toContain("0.01ms");
    expect(rules.transitionDuration).toContain("0.01ms");
    // Not `none`: MUI unmounts transition children from the end event, and a
    // zeroed-out animation still has to fire one.
    expect(rules.animationDuration).not.toBe("none");
  });
});
