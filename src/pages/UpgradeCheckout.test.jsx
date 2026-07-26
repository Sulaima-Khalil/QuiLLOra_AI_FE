import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

/**
 * Handing off to Safepay.
 *
 * The properties worth protecting are all about what this page does *not* do:
 * it does not take a card, it does not write a plan anywhere, and it does not
 * treat a successful call as a purchase. It asks the server for a URL and
 * navigates to it.
 */

const createCheckout = vi.fn();

vi.mock("../utils/planStore", async () => {
  const actual = await vi.importActual("../utils/planStore");
  return {
    ...actual,
    createCheckout: (...args) => createCheckout(...args),
  };
});

const UpgradeCheckout = (await import("./UpgradeCheckout")).default;

const SAFEPAY_URL =
  "https://sandbox.api.getsafepay.com/checkout/subscribe?plan_id=plan_x&auth_token=t&env=sandbox";

/** Renders the page as if arrived at from a plan card. */
const renderCheckout = (state = { planId: "pro", cycle: "monthly" }) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/dashboard/upgrade/checkout", state }]}>
      <Routes>
        <Route path="/dashboard/upgrade/checkout" element={<UpgradeCheckout />} />
        <Route path="/dashboard/upgrade" element={<div>Plans page</div>} />
      </Routes>
    </MemoryRouter>,
  );

let replace;

beforeEach(() => {
  // jsdom refuses a real cross-origin navigation, so the one call this page
  // makes to leave the app is captured instead.
  replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, replace, assign: vi.fn(), href: "http://localhost/" },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Starting a Safepay checkout", () => {
  it("redirects to Safepay for Pro", async () => {
    createCheckout.mockResolvedValue({ checkoutUrl: SAFEPAY_URL });

    renderCheckout({ planId: "pro", cycle: "monthly" });

    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith(SAFEPAY_URL));
    expect(createCheckout).toHaveBeenCalledWith({ planId: "pro", cycle: "monthly" });
  });

  it("redirects to Safepay for Business", async () => {
    createCheckout.mockResolvedValue({ checkoutUrl: SAFEPAY_URL });

    renderCheckout({ planId: "business", cycle: "yearly" });

    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith(SAFEPAY_URL));
    expect(createCheckout).toHaveBeenCalledWith({ planId: "business", cycle: "yearly" });
  });

  it("sends only the plan and cycle — never an amount or a price", async () => {
    createCheckout.mockResolvedValue({ checkoutUrl: SAFEPAY_URL });

    renderCheckout({ planId: "business", cycle: "monthly" });
    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    await waitFor(() => expect(createCheckout).toHaveBeenCalled());
    expect(Object.keys(createCheckout.mock.calls[0][0]).sort()).toEqual(["cycle", "planId"]);
  });

  it("shows a loading state and does not let the button fire twice", async () => {
    let release;
    createCheckout.mockReturnValue(
      new Promise((resolve) => {
        release = () => resolve({ checkoutUrl: SAFEPAY_URL });
      }),
    );

    renderCheckout();

    const button = screen.getByRole("button", { name: /continue to payment/i });
    await userEvent.click(button);

    expect(await screen.findByText(/redirecting to safepay/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();

    release();
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  });

  it("stays put and explains itself when checkout fails", async () => {
    createCheckout.mockRejectedValue({
      response: { status: 503, data: { message: "Card payment is not available right now." } },
    });

    renderCheckout();
    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(
      await screen.findByText(/card payment is not available right now/i),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();

    // Recoverable: the button comes back rather than stranding the user.
    expect(screen.getByRole("button", { name: /continue to payment/i })).toBeEnabled();
  });

  it("does not navigate when the server returns no URL", async () => {
    createCheckout.mockResolvedValue({ checkoutUrl: null });

    renderCheckout();
    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    expect(await screen.findByText(/couldn't start checkout/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("collects no card details", () => {
    renderCheckout();

    for (const pattern of [/card number/i, /expiry/i, /cvc/i, /cvv/i, /cardholder/i]) {
      expect(screen.queryByLabelText(pattern)).toBeNull();
    }

    expect(document.querySelectorAll("input")).toHaveLength(0);
    expect(screen.getByText(/card details are entered on safepay/i)).toBeInTheDocument();
  });

  it("writes no plan to localStorage, before or after checkout", async () => {
    createCheckout.mockResolvedValue({ checkoutUrl: SAFEPAY_URL });

    renderCheckout({ planId: "business", cycle: "yearly" });
    expect(localStorage.length).toBe(0);

    await userEvent.click(screen.getByRole("button", { name: /continue to payment/i }));
    await waitFor(() => expect(replace).toHaveBeenCalled());

    expect(localStorage.length).toBe(0);
    expect(JSON.stringify(localStorage)).not.toMatch(/business|pro|plan/i);
  });

  it("says the plan changes only once the server is told", () => {
    renderCheckout();

    expect(
      screen.getByText(/your plan changes once safepay confirms the payment to us/i),
    ).toBeInTheDocument();
  });

  it("sends a direct visit with no plan back to the plan list", () => {
    renderCheckout(null);

    expect(screen.getByText("Plans page")).toBeInTheDocument();
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it("refuses to check out on Starter, even if routed here with it", () => {
    renderCheckout({ planId: "starter", cycle: "monthly" });

    expect(screen.getByText("Plans page")).toBeInTheDocument();
    expect(createCheckout).not.toHaveBeenCalled();
  });
});
