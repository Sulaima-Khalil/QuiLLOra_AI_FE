import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPlanLimitError } from "./apiClient";

/**
 * Entitlement state on the client.
 *
 * This exists to explain a limit, never to impose one. The tests below pin
 * both halves: the data renders faithfully, and nothing here is treated as a
 * decision the server has not already made.
 */

const get = vi.fn();

vi.mock("./apiClient", async () => {
  const actual = await vi.importActual("./apiClient");
  return {
    ...actual,
    default: { get: (...a) => get(...a) },
    api: { get: (...a) => get(...a) },
    unwrap: (r) => r?.data?.data ?? null,
  };
});

const ENTITLEMENTS = {
  planId: "starter",
  capabilities: {
    articles: { limit: 3, usage: 3, remaining: 0, enforced: true, reached: true },
    teamMembers: { limit: 1, usage: 1, remaining: 0, enforced: true, reached: true },
    aiGenerationsPerDay: { limit: 5, usage: null, remaining: null, enforced: false, reached: false },
  },
  enforcedCapabilities: ["articles", "teamMembers"],
};

const load = async () => {
  const mod = await import("./entitlementsStore");
  mod.resetEntitlements();
  return mod;
};

beforeEach(() => {
  get.mockReset();
});

describe("entitlementsStore", () => {
  it("knows nothing until the server answers", async () => {
    const { getEntitlements, areEntitlementsLoaded, capability } = await load();

    expect(getEntitlements()).toBeNull();
    expect(areEntitlementsLoaded()).toBe(false);
    expect(capability("articles")).toBeNull();
  });

  it("reads limit, usage, remaining and enforcement from the server", async () => {
    get.mockResolvedValue({ data: { data: { entitlements: ENTITLEMENTS } } });

    const { fetchEntitlements, capability } = await load();
    await fetchEntitlements();

    expect(get).toHaveBeenCalledWith("/billing/entitlements");
    expect(capability("articles")).toEqual({
      limit: 3,
      usage: 3,
      remaining: 0,
      enforced: true,
      reached: true,
    });
  });

  it("treats an unenforced capability as not reached, whatever its limit", async () => {
    get.mockResolvedValue({ data: { data: { entitlements: ENTITLEMENTS } } });

    const { fetchEntitlements, isLimitReached, capability } = await load();
    await fetchEntitlements();

    expect(capability("aiGenerationsPerDay").enforced).toBe(false);
    expect(isLimitReached("aiGenerationsPerDay")).toBe(false);
  });

  it("reports no limit for an unknown capability rather than guessing", async () => {
    get.mockResolvedValue({ data: { data: { entitlements: ENTITLEMENTS } } });

    const { fetchEntitlements, isLimitReached } = await load();
    await fetchEntitlements();

    expect(isLimitReached("somethingElse")).toBe(false);
  });

  it("stays silent when the request fails — the server still enforces", async () => {
    get.mockRejectedValue(new Error("unauthorised"));

    const { fetchEntitlements, getEntitlements, isLimitReached } = await load();
    await fetchEntitlements();

    expect(getEntitlements()).toBeNull();
    expect(isLimitReached("articles")).toBe(false);
  });

  it("shares one request between concurrent callers", async () => {
    let release;
    const gate = new Promise((r) => { release = r; });
    get.mockImplementation(async () => { await gate; return { data: { data: { entitlements: ENTITLEMENTS } } }; });

    const { fetchEntitlements } = await load();
    const both = Promise.all([fetchEntitlements(), fetchEntitlements()]);
    await new Promise((r) => setTimeout(r, 10));

    expect(get).toHaveBeenCalledTimes(1);
    release();
    await both;
  });

  it("notifies subscribers", async () => {
    get.mockResolvedValue({ data: { data: { entitlements: ENTITLEMENTS } } });

    const { fetchEntitlements, subscribeEntitlements } = await load();
    const listener = vi.fn();
    const off = subscribeEntitlements(listener);

    await fetchEntitlements();

    expect(listener).toHaveBeenCalledWith(ENTITLEMENTS);
    off();
  });
});

describe("isPlanLimitError", () => {
  const limitError = {
    response: {
      status: 403,
      data: {
        success: false,
        code: "PLAN_LIMIT_REACHED",
        message: "The Starter plan includes 3 articles. Upgrade to write more.",
      },
    },
  };

  it("recognises the server's limit refusal", () => {
    expect(isPlanLimitError(limitError)).toBe(true);
  });

  it("does not confuse it with an ownership refusal, which is also 403", () => {
    expect(
      isPlanLimitError({
        response: { status: 403, data: { code: "FORBIDDEN", message: "You can only modify your own articles" } },
      }),
    ).toBe(false);
  });

  it("is false for unrelated failures", () => {
    expect(isPlanLimitError({ response: { status: 500, data: {} } })).toBe(false);
    expect(isPlanLimitError(new Error("Network Error"))).toBe(false);
    expect(isPlanLimitError(undefined)).toBe(false);
  });

  it("carries a message a person can act on", () => {
    // The 403 message is a 4xx, so errorMessage repeats it verbatim.
    expect(limitError.response.data.message).toMatch(/Upgrade/);
    expect(limitError.response.data.message).not.toMatch(/PLAN_LIMIT_REACHED/);
  });
});
