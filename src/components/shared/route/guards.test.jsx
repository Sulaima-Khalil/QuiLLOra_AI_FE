import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

/**
 * Guard behaviour, driven through the real `quillora_session` flag the guards
 * read via `isAuthenticated()`. Nothing here mocks the guards themselves.
 */

const SESSION_KEY = "quillora_session";

const signIn = () => localStorage.setItem(SESSION_KEY, JSON.stringify({ id: "u1", name: "Alex", at: 1 }));

/** Renders a miniature app with the two guarded routes plus a landing page. */
const renderAt = (path, ui) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Landing</div>} />
        <Route path="/login" element={<div>Login screen</div>} />
        <Route path="/dashboard" element={<ProtectedRoute>{ui ?? <div>Dashboard</div>}</ProtectedRoute>} />
        <Route path="/guest" element={<GuestRoute><div>Guest only</div></GuestRoute>} />
        <Route path="/article/:id" element={<div>Public reader</div>} />
        <Route path="*" element={<div>404 page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => localStorage.clear());

  it("redirects an unauthenticated visitor to the login screen", () => {
    renderAt("/dashboard");

    expect(screen.getByText("Login screen")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders the protected page for an authenticated visitor", () => {
    signIn();
    renderAt("/dashboard");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  });

  it("never mounts the protected child when redirecting — the lazy chunk is not requested", () => {
    const mounted = vi.fn();
    const Spy = () => {
      mounted();
      return <div>Dashboard</div>;
    };

    renderAt("/dashboard", <Spy />);

    expect(mounted).not.toHaveBeenCalled();
  });
});

describe("GuestRoute", () => {
  beforeEach(() => localStorage.clear());

  it("renders the auth screen for a signed-out visitor", () => {
    renderAt("/guest");
    expect(screen.getByText("Guest only")).toBeInTheDocument();
  });

  it("sends an already-signed-in visitor to the dashboard", () => {
    signIn();
    renderAt("/guest");

    // The mini-app's /dashboard is itself protected, and the session is valid,
    // so the redirect lands on the dashboard rather than back at login.
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Guest only")).not.toBeInTheDocument();
  });
});

describe("public and fallback routes", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the article reader reachable while signed out", () => {
    renderAt("/article/6a646e52e31f34264a01f56e");

    expect(screen.getByText("Public reader")).toBeInTheDocument();
    expect(screen.queryByText("Login screen")).not.toBeInTheDocument();
  });

  it("still renders the 404 page for an unknown path", () => {
    renderAt("/no-such-page");
    expect(screen.getByText("404 page")).toBeInTheDocument();
  });
});
