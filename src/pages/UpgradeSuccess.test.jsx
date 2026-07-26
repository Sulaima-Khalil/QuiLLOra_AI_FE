import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

/**
 * The page Safepay returns the browser to.
 *
 * One property matters above the rest: arriving here is a navigation, and a
 * navigation is not a payment. The page must report the server's answer and
 * never improve on it.
 */

let subscription;
let listeners;

const fetchSubscription = vi.fn();

/*
 * A minimal stand-in for the real store: a value, a set of subscribers, and a
 * fetch that notifies them. The page is supposed to re-render off the store's
 * change event rather than off its own state, and a no-op `subscribe` would
 * quietly hide it if it stopped doing that.
 */
vi.mock("../utils/planStore", async () => {
  const actual = await vi.importActual("../utils/planStore");
  return {
    ...actual,
    getSubscription: () => subscription,
    isSubscriptionLoaded: () => false,
    fetchSubscription: async () => {
      const result = await fetchSubscription();
      listeners.forEach((listener) => listener(subscription));
      return result;
    },
    subscribeSubscription: (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
});

const UpgradeSuccess = (await import("./UpgradeSuccess")).default;

const FREE = {
  planId: "starter",
  cycle: "monthly",
  status: "active",
  currentPeriodEnd: null,
  pendingPlanId: null,
  pendingCycle: null,
};

const PENDING = { ...FREE, pendingPlanId: "business", pendingCycle: "yearly" };

const ACTIVE_PRO = {
  planId: "pro",
  cycle: "monthly",
  status: "active",
  currentPeriodEnd: "2027-01-15T00:00:00.000Z",
  pendingPlanId: null,
  pendingCycle: null,
};

const renderSuccess = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard/upgrade/success"]}>
      <Routes>
        <Route path="/dashboard/upgrade/success" element={<UpgradeSuccess />} />
        <Route path="/dashboard/upgrade" element={<div>Plans page</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  subscription = FREE;
  listeners = new Set();
  fetchSubscription.mockResolvedValue(undefined);
});

describe("Returning from Safepay", () => {
  it("re-reads the plan from the server rather than trusting the redirect", async () => {
    subscription = PENDING;
    renderSuccess();

    await waitFor(() => expect(fetchSubscription).toHaveBeenCalled());
  });

  it("does not claim a plan is active just because the user landed here", async () => {
    subscription = PENDING;
    renderSuccess();

    expect(await screen.findByText(/confirming your payment/i)).toBeInTheDocument();
    expect(screen.getByText(/awaiting confirmation/i)).toBeInTheDocument();
    expect(screen.queryByText(/you're on business/i)).toBeNull();
  });

  it("says outright that the redirect activates nothing", async () => {
    subscription = PENDING;
    renderSuccess();

    expect(
      await screen.findByText(/returning to this page doesn't activate anything on its own/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/once safepay confirms the payment to our servers/i)).toBeInTheDocument();
  });

  it("advertises no unlocked features while confirmation is outstanding", async () => {
    subscription = PENDING;
    renderSuccess();

    await screen.findByText(/confirming your payment/i);

    expect(screen.queryByText(/write with unlimited ai/i)).toBeNull();
    expect(screen.queryByText(/bring your team in/i)).toBeNull();
  });

  it("congratulates the user only once the server says the plan is active", async () => {
    subscription = ACTIVE_PRO;
    renderSuccess();

    expect(await screen.findByText(/you're on pro/i)).toBeInTheDocument();
    expect(screen.getByText(/write with unlimited ai/i)).toBeInTheDocument();
    expect(screen.queryByText(/confirming your payment/i)).toBeNull();
  });

  it("can re-check, and picks up an activation that lands after the redirect", async () => {
    subscription = PENDING;
    renderSuccess();

    await screen.findByText(/confirming your payment/i);

    // The webhook arrives while the user is looking at the page.
    subscription = ACTIVE_PRO;

    await userEvent.click(screen.getByRole("button", { name: /check again/i }));

    expect(await screen.findByText(/you're on pro/i)).toBeInTheDocument();
    expect(fetchSubscription).toHaveBeenCalledTimes(2);
  });

  it("writes nothing to localStorage", async () => {
    subscription = ACTIVE_PRO;
    renderSuccess();

    await screen.findByText(/you're on pro/i);

    expect(localStorage.length).toBe(0);
  });

  it("quotes no amount it has not been told", async () => {
    subscription = ACTIVE_PRO;
    renderSuccess();

    await screen.findByText(/you're on pro/i);

    // Safepay charges in its own currency; a dollar figure here would be a
    // guess presented as a receipt.
    expect(screen.queryByText(/\$\d/)).toBeNull();
    expect(screen.getByText(/safepay emails your receipt/i)).toBeInTheDocument();
  });

  it("sends someone with nothing pending and nothing active back to the plans", async () => {
    subscription = FREE;
    renderSuccess();

    expect(await screen.findByText("Plans page")).toBeInTheDocument();
  });

  it("falls back to the free plan when the server cannot be reached", async () => {
    subscription = FREE;
    fetchSubscription.mockRejectedValue(new Error("offline"));

    renderSuccess();

    // Never a paid plan on a failed read.
    expect(await screen.findByText("Plans page")).toBeInTheDocument();
  });
});
