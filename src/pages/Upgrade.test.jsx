import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

/**
 * The plan list.
 *
 * Choosing Pro or Business starts the payment flow; choosing Starter must not,
 * because there is nothing to buy and opening a Safepay session for a free
 * plan would fail at the provider.
 */

let subscription;

vi.mock("../utils/planStore", async () => {
  const actual = await vi.importActual("../utils/planStore");
  return {
    ...actual,
    getSubscription: () => subscription,
    fetchSubscription: () => Promise.resolve(subscription),
    subscribeSubscription: () => () => {},
  };
});

const Upgrade = (await import("./Upgrade")).default;

const FREE = { planId: "starter", cycle: "monthly", status: "active" };
const ACTIVE_PRO = { planId: "pro", cycle: "monthly", status: "active" };

/** Reports where the flow navigated to, and with what. */
const CheckoutProbe = () => {
  const { state } = useLocation();
  return <div data-testid="checkout">{JSON.stringify(state)}</div>;
};

const renderUpgrade = (entry = "/dashboard/upgrade") =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/dashboard/upgrade" element={<Upgrade />} />
        <Route path="/dashboard/upgrade/checkout" element={<CheckoutProbe />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  subscription = FREE;
});

describe("Choosing a plan", () => {
  it("takes Pro to the checkout step", async () => {
    renderUpgrade();

    await userEvent.click(screen.getByRole("button", { name: /upgrade to pro/i }));

    expect(JSON.parse(screen.getByTestId("checkout").textContent)).toEqual({
      planId: "pro",
      cycle: "monthly",
    });
  });

  it("takes Business to the checkout step, carrying the chosen cycle", async () => {
    renderUpgrade();

    // The monthly/yearly toggle.
    await userEvent.click(screen.getByRole("switch"));
    await userEvent.click(screen.getByRole("button", { name: /upgrade to business/i }));

    expect(JSON.parse(screen.getByTestId("checkout").textContent)).toEqual({
      planId: "business",
      cycle: "yearly",
    });
  });

  it("does not start checkout for Starter", async () => {
    // On Pro, so the Starter card is not the "current plan" case.
    subscription = ACTIVE_PRO;
    renderUpgrade();

    const starter = screen.getByRole("button", { name: /free plan/i });

    expect(starter).toBeDisabled();

    // `pointerEventsCheck: 0` bypasses the disabled button's `pointer-events:
    // none` so the click genuinely lands — the point is that nothing happens
    // even then, not that the pointer never got there.
    await userEvent.click(starter, { pointerEventsCheck: 0 });

    expect(screen.queryByTestId("checkout")).toBeNull();
  });

  it("offers no button on the plan already held", () => {
    subscription = ACTIVE_PRO;
    renderUpgrade();

    expect(screen.getByRole("button", { name: /current plan/i })).toBeDisabled();
  });
});

describe("Coming back from an abandoned checkout", () => {
  it("says nothing was charged, and changes nothing", async () => {
    renderUpgrade("/dashboard/upgrade?checkout=cancelled");

    expect(
      await screen.findByText(/nothing was charged and your plan hasn't changed/i),
    ).toBeInTheDocument();

    // Still on the free plan, and still able to try again.
    expect(screen.getByRole("button", { name: /upgrade to pro/i })).toBeEnabled();
    expect(localStorage.length).toBe(0);
  });

  it("shows no such notice on an ordinary visit", () => {
    renderUpgrade();

    expect(screen.queryByText(/checkout cancelled/i)).toBeNull();
  });
});
