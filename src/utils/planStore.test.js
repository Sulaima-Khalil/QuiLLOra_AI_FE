import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Subscription state on the client.
 *
 * The whole point of this rewrite: the browser is a cache, not an authority.
 * These tests pin that — no plan is written to storage, storage cannot grant
 * one, and every change goes through the API.
 */

const get = vi.fn();
const post = vi.fn();

vi.mock("./apiClient", () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
  api: { get: (...a) => get(...a), post: (...a) => post(...a) },
  unwrap: (r) => r?.data?.data ?? null,
}));

const PAID = {
  planId: "business",
  status: "active",
  cycle: "yearly",
  startedAt: "2026-01-01T00:00:00.000Z",
  currentPeriodEnd: "2027-01-01T00:00:00.000Z",
  pendingPlanId: null,
};

const FREE = { planId: "starter", status: "active", cycle: "monthly", pendingPlanId: null };

const load = async () => {
  const mod = await import("./planStore");
  mod.resetSubscription();
  return mod;
};

const subscriptionResponse = (subscription, paymentConfigured = false) => ({
  data: { data: { subscription, paymentConfigured } },
});

beforeEach(() => {
  get.mockReset();
  post.mockReset();
  localStorage.clear();
});

describe("planStore — the server is the authority", () => {
  it("assumes the free plan before the server has answered", async () => {
    const { getSubscription, isSubscriptionLoaded } = await load();

    expect(getSubscription().planId).toBe("starter");
    expect(isSubscriptionLoaded()).toBe(false);
  });

  it("takes the plan from GET /billing/subscription", async () => {
    get.mockResolvedValue(subscriptionResponse(PAID));

    const { fetchSubscription, getSubscription } = await load();
    await fetchSubscription();

    expect(get).toHaveBeenCalledWith("/billing/subscription");
    expect(getSubscription()).toMatchObject({ planId: "business", cycle: "yearly" });
  });

  it("writes no plan to localStorage — there is nothing to tamper with", async () => {
    get.mockResolvedValue(subscriptionResponse(PAID));

    const { fetchSubscription } = await load();
    await fetchSubscription();

    expect(localStorage.getItem("quillora_subscription")).toBeNull();
    expect(JSON.stringify(localStorage)).not.toContain("business");
  });

  it("ignores a plan planted in localStorage", async () => {
    // Exactly the old exploit: forge the key the store used to trust.
    localStorage.setItem(
      "quillora_subscription",
      JSON.stringify({ planId: "business", status: "active", cycle: "yearly" }),
    );
    get.mockResolvedValue(subscriptionResponse(FREE));

    const { fetchSubscription, getSubscription } = await load();

    // Even before any request, the forged value is not read.
    expect(getSubscription().planId).toBe("starter");

    await fetchSubscription();
    expect(getSubscription().planId).toBe("starter");
  });

  it("falls back to the free plan when the request fails, never a cached paid one", async () => {
    get.mockResolvedValueOnce(subscriptionResponse(PAID));
    const { fetchSubscription, getSubscription } = await load();
    await fetchSubscription();
    expect(getSubscription().planId).toBe("business");

    // Session lost.
    get.mockRejectedValueOnce(Object.assign(new Error("unauthorised"), { response: { status: 401 } }));
    await fetchSubscription().catch(() => {});

    expect(getSubscription().planId).toBe("starter");
  });

  it("shares one in-flight request between concurrent callers", async () => {
    let release;
    const gate = new Promise((r) => { release = r; });
    get.mockImplementation(async () => { await gate; return subscriptionResponse(FREE); });

    const { fetchSubscription } = await load();
    const both = Promise.all([fetchSubscription(), fetchSubscription()]);
    await new Promise((r) => setTimeout(r, 10));

    expect(get).toHaveBeenCalledTimes(1);
    release();
    await both;
  });

  it("drops the plan on reset, so no plan survives a sign-out", async () => {
    get.mockResolvedValue(subscriptionResponse(PAID));
    const { fetchSubscription, resetSubscription, getSubscription } = await load();

    await fetchSubscription();
    expect(getSubscription().planId).toBe("business");

    resetSubscription();
    expect(getSubscription().planId).toBe("starter");
  });
});

describe("planStore — requesting an upgrade", () => {
  it("sends only the plan id and cycle, never a price", async () => {
    post.mockResolvedValue({
      data: { message: "recorded", data: { subscription: { ...FREE, pendingPlanId: "pro" }, paymentConfigured: false, amountDue: 19, currency: "USD" } },
    });

    const { requestUpgrade } = await load();
    await requestUpgrade({ planId: "pro", cycle: "monthly" });

    expect(post).toHaveBeenCalledWith("/billing/subscription/request", {
      planId: "pro",
      cycle: "monthly",
    });

    const [, body] = post.mock.calls[0];
    expect(body).not.toHaveProperty("price");
    expect(body).not.toHaveProperty("amountDue");
  });

  it("does not mark the user as upgraded — the server said pending", async () => {
    post.mockResolvedValue({
      data: {
        message: "Payment is not available yet.",
        data: {
          subscription: { ...FREE, pendingPlanId: "business", pendingCycle: "yearly" },
          paymentConfigured: false,
          amountDue: 468,
          currency: "USD",
        },
      },
    });

    const { requestUpgrade, getSubscription } = await load();
    const result = await requestUpgrade({ planId: "business", cycle: "yearly" });

    expect(result.paymentConfigured).toBe(false);
    expect(getSubscription().planId).toBe("starter");
    expect(getSubscription().pendingPlanId).toBe("business");
  });

  it("surfaces a rejected request and leaves the plan alone", async () => {
    get.mockResolvedValue(subscriptionResponse(FREE));
    post.mockRejectedValue({ response: { status: 409, data: { message: "You are already on Pro" } } });

    const { fetchSubscription, requestUpgrade, getSubscription } = await load();
    await fetchSubscription();

    await expect(requestUpgrade({ planId: "pro", cycle: "monthly" })).rejects.toMatchObject({
      response: { status: 409 },
    });
    expect(getSubscription().planId).toBe("starter");
  });

  it("reflects a server-confirmed paid plan after a refetch", async () => {
    post.mockResolvedValue({
      data: { message: "ok", data: { subscription: { ...FREE, pendingPlanId: "pro" }, paymentConfigured: false } },
    });

    const { requestUpgrade, fetchSubscription, getSubscription } = await load();
    await requestUpgrade({ planId: "pro", cycle: "monthly" });
    expect(getSubscription().planId).toBe("starter");

    // A provider webhook lands server-side; the next read shows it.
    get.mockResolvedValue(subscriptionResponse({ ...PAID, planId: "pro", cycle: "monthly" }));
    await fetchSubscription();

    expect(getSubscription()).toMatchObject({ planId: "pro", status: "active" });
  });
});

describe("planStore — cancelling", () => {
  it("returns to the free plan through the API", async () => {
    get.mockResolvedValue(subscriptionResponse(PAID));
    post.mockResolvedValue({ data: { data: { subscription: { ...FREE, status: "cancelled" } } } });

    const { fetchSubscription, cancelPlan, getSubscription } = await load();
    await fetchSubscription();
    await cancelPlan();

    expect(post).toHaveBeenCalledWith("/billing/subscription/cancel", {});
    expect(getSubscription()).toMatchObject({ planId: "starter", status: "cancelled" });
  });
});

describe("planStore — catalogue", () => {
  it("reads plans and the payment-configured flag from the server", async () => {
    get.mockResolvedValue({
      data: { data: { plans: [{ id: "pro", name: "Pro", price: { monthly: 19, yearly: 15 } }], paymentConfigured: false } },
    });

    const { fetchPlans, isPaymentConfigured } = await load();
    const plans = await fetchPlans();

    expect(get).toHaveBeenCalledWith("/billing/plans");
    expect(plans[0].price.monthly).toBe(19);
    expect(isPaymentConfigured()).toBe(false);
  });
});
