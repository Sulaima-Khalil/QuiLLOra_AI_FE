import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Transparent-refresh tests for the API client.
 *
 * The network is mocked at the axios *adapter*, the layer directly below the
 * interceptors. Everything under test — the single-flight refresh promise, the
 * `_retried` guard, the NO_RETRY list, the session-expired event — is the real
 * production code path.
 *
 * `refreshPromise` is module state, so each test re-imports the module through
 * `vi.resetModules()` to start from a clean slate.
 */

/** Builds an adapter plus a log of the requests it saw. */
const makeAdapter = (handler) => {
  const calls = [];

  const adapter = async (config) => {
    const url = config.url;
    calls.push({ url, method: config.method });

    const result = handler(config, calls.filter((c) => c.url === url).length);

    if (result.status >= 400) {
      const error = new Error(`Request failed with status code ${result.status}`);
      error.config = config;
      error.response = { status: result.status, data: result.data ?? {}, config, headers: {} };
      error.isAxiosError = true;
      throw error;
    }

    return { status: result.status, data: result.data ?? {}, config, headers: {}, statusText: "OK" };
  };

  return { adapter, calls };
};

const countOf = (calls, url) => calls.filter((c) => c.url === url).length;

let api;
let clearSessionFlag;

const load = async (adapter) => {
  vi.resetModules();
  const mod = await import("./apiClient");
  mod.api.defaults.adapter = adapter;
  api = mod.api;
  clearSessionFlag = mod.clearSessionFlag;
  return mod;
};

describe("apiClient — concurrent 401s", () => {
  let expired;

  beforeEach(() => {
    expired = vi.fn();
    window.addEventListener("quillora-session-expired", expired);
  });

  afterEach(() => {
    window.removeEventListener("quillora-session-expired", expired);
  });

  it("sends exactly one refresh for many simultaneous 401s, then replays each request once", async () => {
    // Every protected endpoint 401s on its first call and succeeds after the
    // refresh; the refresh itself succeeds once.
    const { adapter, calls } = makeAdapter((config, attempt) => {
      if (config.url === "/auth/refresh") return { status: 200, data: { success: true } };
      if (attempt === 1) return { status: 401, data: { message: "expired" } };
      return { status: 200, data: { success: true, data: { url: config.url } } };
    });

    await load(adapter);

    const results = await Promise.all([
      api.get("/articles"),
      api.get("/auth/me"),
      api.get("/collections"),
      api.get("/team"),
    ]);

    // One refresh for four concurrent failures.
    expect(countOf(calls, "/auth/refresh")).toBe(1);

    // Each original request: one failed attempt plus exactly one replay.
    for (const url of ["/articles", "/auth/me", "/collections", "/team"]) {
      expect(countOf(calls, url), `${url} attempts`).toBe(2);
    }

    // All four resolved with their own payload, so the replays were not crossed.
    expect(results.map((r) => r.data.data.url)).toEqual([
      "/articles",
      "/auth/me",
      "/collections",
      "/team",
    ]);

    expect(expired).not.toHaveBeenCalled();
  });

  it("shares one in-flight refresh promise rather than stampeding the endpoint", async () => {
    let releaseRefresh;
    const refreshGate = new Promise((resolve) => {
      releaseRefresh = resolve;
    });

    const { adapter } = makeAdapter((config, attempt) => {
      if (config.url === "/auth/refresh") return { status: 200, data: {} };
      if (attempt === 1) return { status: 401, data: {} };
      return { status: 200, data: {} };
    });

    // Counted before the await, so a refresh still in flight is visible.
    let refreshesStarted = 0;

    const gated = async (config) => {
      if (config.url === "/auth/refresh") {
        refreshesStarted += 1;
        await refreshGate;
      }
      return adapter(config);
    };

    await load(gated);

    const pending = Promise.all([api.get("/a"), api.get("/b"), api.get("/c")]);

    // Let the three 401s resolve and queue behind the same refresh.
    await new Promise((r) => setTimeout(r, 20));
    expect(refreshesStarted).toBe(1);

    releaseRefresh();
    await pending;

    expect(refreshesStarted).toBe(1);
  });
});

describe("apiClient — refresh failure", () => {
  let expired;

  beforeEach(() => {
    expired = vi.fn();
    window.addEventListener("quillora-session-expired", expired);
  });

  afterEach(() => {
    window.removeEventListener("quillora-session-expired", expired);
  });

  it("rejects the pending requests, clears the session flag and raises session-expired once", async () => {
    const { adapter, calls } = makeAdapter((config) => {
      if (config.url === "/auth/refresh") return { status: 401, data: { message: "no session" } };
      return { status: 401, data: { message: "expired" } };
    });

    await load(adapter);
    localStorage.setItem("quillora_session", JSON.stringify({ id: "u1" }));

    const outcomes = await Promise.allSettled([api.get("/articles"), api.get("/auth/me")]);

    expect(outcomes.every((o) => o.status === "rejected")).toBe(true);
    expect(localStorage.getItem("quillora_session")).toBeNull();
    expect(expired).toHaveBeenCalled();

    // The failed refresh is not itself retried.
    expect(countOf(calls, "/auth/refresh")).toBe(1);
  });

  it("does not loop: a request that 401s again after a successful refresh is not retried a second time", async () => {
    // The refresh succeeds but the replay still 401s — the classic infinite
    // retry shape. `_retried` must stop it.
    const { adapter, calls } = makeAdapter((config) => {
      if (config.url === "/auth/refresh") return { status: 200, data: {} };
      return { status: 401, data: {} };
    });

    await load(adapter);

    await expect(api.get("/articles")).rejects.toThrow();

    // Original + one replay, and no further refresh attempts.
    expect(countOf(calls, "/articles")).toBe(2);
    expect(countOf(calls, "/auth/refresh")).toBe(1);
  });

  it("lets a later request refresh again once the in-flight refresh has settled", async () => {
    // refreshPromise is cleared in `finally`, so the client is not wedged
    // after one failure.
    const { adapter, calls } = makeAdapter((config, attempt) => {
      if (config.url === "/auth/refresh") {
        return countOf(calls, "/auth/refresh") === 1 ? { status: 401, data: {} } : { status: 200, data: {} };
      }
      if (attempt === 1) return { status: 401, data: {} };
      return { status: 200, data: {} };
    });

    await load(adapter);

    await expect(api.get("/first")).rejects.toThrow();
    await expect(api.get("/second")).resolves.toBeTruthy();

    expect(countOf(calls, "/auth/refresh")).toBe(2);
  });
});

describe("apiClient — NO_RETRY endpoints", () => {
  it.each([
    ["/auth/login", "post"],
    ["/auth/register", "post"],
    ["/auth/refresh", "post"],
    ["/auth/logout", "post"],
  ])("%s does not trigger a refresh or a replay on 401", async (url, method) => {
    const { adapter, calls } = makeAdapter(() => ({ status: 401, data: { message: "Invalid credentials" } }));

    await load(adapter);

    await expect(api[method](url, {})).rejects.toMatchObject({
      response: { status: 401, data: { message: "Invalid credentials" } },
    });

    // Called once, never replayed.
    expect(countOf(calls, url)).toBe(1);
    // And no refresh was attempted on its behalf.
    if (url !== "/auth/refresh") expect(countOf(calls, "/auth/refresh")).toBe(0);
  });

  it("passes a wrong-password 401 straight back to the caller", async () => {
    const { adapter } = makeAdapter(() => ({
      status: 401,
      data: { message: "Invalid email or password." },
    }));

    await load(adapter);

    const error = await api.post("/auth/login", {}).catch((e) => e);
    expect(error.response.data.message).toBe("Invalid email or password.");
  });

  it("leaves non-401 failures alone", async () => {
    const { adapter, calls } = makeAdapter(() => ({ status: 500, data: { message: "boom" } }));

    await load(adapter);

    await expect(api.get("/articles")).rejects.toMatchObject({ response: { status: 500 } });
    expect(countOf(calls, "/articles")).toBe(1);
    expect(countOf(calls, "/auth/refresh")).toBe(0);
  });
});

describe("apiClient — errorMessage never repeats server internals", () => {
  // The exact string that reached the login form when Atlas was unreachable.
  const SSL_LEAK =
    "F8050000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal " +
    "error:c:\\ws\\deps\\openssl\\openssl\\ssl\\record\\rec_layer_s3.c:1601:SSL alert number 80";

  const failure = (status, message) => ({ response: { status, data: { message } } });

  it("repeats a 4xx message, which is written for the reader", async () => {
    const mod = await load(makeAdapter(() => ({ status: 200, data: {} })).adapter);

    expect(mod.errorMessage(failure(401, "Invalid email or password."), "fallback")).toBe(
      "Invalid email or password.",
    );
    expect(mod.errorMessage(failure(422, "Enter at least 2 characters"), "fallback")).toBe(
      "Enter at least 2 characters",
    );
  });

  it("swallows a 500 message and shows the caller's fallback instead", async () => {
    const mod = await load(makeAdapter(() => ({ status: 200, data: {} })).adapter);

    const result = mod.errorMessage(failure(500, SSL_LEAK), "Invalid email or password.");

    expect(result).toBe("Invalid email or password.");
    expect(result).not.toContain("SSL");
    expect(result).not.toContain("openssl");
    expect(result).not.toContain("rec_layer_s3.c");
  });

  it.each([500, 502, 503])("swallows a %s message", async (status) => {
    const mod = await load(makeAdapter(() => ({ status: 200, data: {} })).adapter);

    expect(mod.errorMessage(failure(status, "MongooseServerSelectionError: connect ETIMEDOUT"), "fb")).toBe("fb");
  });

  it("turns a dropped connection into a sentence, not an axios diagnostic", async () => {
    const mod = await load(makeAdapter(() => ({ status: 200, data: {} })).adapter);

    const result = mod.errorMessage(Object.assign(new Error("Network Error"), {}), "fb");

    expect(result).toMatch(/Can't reach the server/);
    expect(result).not.toContain("Network Error");
  });

  it("names the timeout case specifically", async () => {
    const mod = await load(makeAdapter(() => ({ status: 200, data: {} })).adapter);

    const timeout = Object.assign(new Error("timeout of 20000ms exceeded"), { code: "ECONNABORTED" });

    expect(mod.errorMessage(timeout, "fb")).toMatch(/took too long/);
    expect(mod.errorMessage(timeout, "fb")).not.toContain("20000ms");
  });

  it("keeps a 5xx internal out of the sign-in form end to end", async () => {
    // A real login round trip against a server that 500s with the leak.
    const { adapter } = makeAdapter(() => ({ status: 500, data: { message: SSL_LEAK } }));
    await load(adapter);

    vi.resetModules();
    vi.doMock("./apiClient", async () => {
      const actual = await vi.importActual("./apiClient");
      return { ...actual, default: api, api };
    });

    const { loginUser } = await import("./auth");
    const error = await loginUser({ email: "a@b.co", password: "x" }).catch((e) => e);

    // Proves the request really reached the adapter and failed with the leak.
    expect(error.response.status).toBe(500);
    // This is the string Login.jsx renders.
    expect(error.response.data.message).toBe("Invalid email or password.");
    expect(JSON.stringify(error)).not.toContain("openssl");

    vi.doUnmock("./apiClient");
  });
});

describe("apiClient — session flag", () => {
  it("round-trips and clears the flag, including the legacy token keys", async () => {
    const { adapter } = makeAdapter(() => ({ status: 200, data: {} }));
    const mod = await load(adapter);

    mod.setSessionFlag({ id: "u1", name: "Alex" });
    expect(mod.hasSessionFlag()).toBe(true);

    localStorage.setItem("token", "legacy");
    localStorage.setItem("authToken", "legacy");

    clearSessionFlag();

    expect(mod.hasSessionFlag()).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("never stores a credential in the flag — only id, name and a timestamp", async () => {
    const { adapter } = makeAdapter(() => ({ status: 200, data: {} }));
    const mod = await load(adapter);

    mod.setSessionFlag({ id: "u1", name: "Alex", email: "alex@inkflow.ai", password: "demo1234" });

    const stored = JSON.parse(localStorage.getItem("quillora_session"));
    expect(Object.keys(stored).sort()).toEqual(["at", "id", "name"]);
    expect(JSON.stringify(stored)).not.toContain("demo1234");
    expect(JSON.stringify(stored)).not.toContain("alex@inkflow.ai");
  });
});
