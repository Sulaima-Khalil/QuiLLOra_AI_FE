import { describe, it, expect, vi, afterEach } from "vitest";
import { rememberResetEmail, getResetEmail, forgetResetEmail } from "./resetFlow";

/**
 * The three-step password reset carries the address being recovered across
 * screens; the 6-digit code deliberately travels only in router state.
 *
 * These tests walk the same sequence the pages perform (ForgotPassword →
 * VerifyResetCode → ResetPassword) against the real store.
 */

const CODE = "482913";
const EMAIL = "alex@inkflow.ai";

/** Everything either storage holds, as one searchable string. */
const allStoredText = () => {
  const dump = (store) =>
    Object.keys(store).map((k) => `${k}=${store.getItem(k)}`).join("|");
  return `${dump(sessionStorage)}|${dump(localStorage)}`;
};

describe("password reset — persistence across steps", () => {
  it("carries the email from step 1 through steps 2 and 3, then clears it", () => {
    // Step 1: ForgotPassword remembers the address before navigating.
    rememberResetEmail(EMAIL);
    expect(getResetEmail()).toBe(EMAIL);

    // Step 2: VerifyResetCode re-remembers whatever address it resolved.
    rememberResetEmail(getResetEmail());
    expect(getResetEmail()).toBe(EMAIL);

    // Step 3: ResetPassword clears it once the reset succeeds.
    forgetResetEmail();
    expect(getResetEmail()).toBe("");
  });

  it("survives a hard refresh on step 2 or 3 — the point of using sessionStorage", () => {
    rememberResetEmail(EMAIL);

    // A reload drops router state; sessionStorage is what remains.
    const afterReload = getResetEmail();

    expect(afterReload).toBe(EMAIL);
    expect(sessionStorage.getItem("quillora_reset_email")).toBe(EMAIL);
  });

  it("is tab-scoped: nothing is written to localStorage", () => {
    rememberResetEmail(EMAIL);
    expect(localStorage.length).toBe(0);
  });
});

describe("password reset — the code is never persisted", () => {
  it("stores no trace of the 6-digit code in either storage", () => {
    // Walk the whole flow as the pages do, with a code in hand throughout.
    rememberResetEmail(EMAIL);
    rememberResetEmail(EMAIL); // step 2 re-remembers
    // Step 3 receives { email, code } as router state and stores neither.

    expect(allStoredText()).not.toContain(CODE);
    expect(sessionStorage.getItem("quillora_reset_code")).toBeNull();
    expect(localStorage.getItem("quillora_reset_code")).toBeNull();

    // The only key the flow owns is the email.
    expect(Object.keys(sessionStorage)).toEqual(["quillora_reset_email"]);
  });

  it("leaves nothing behind after the reset completes", () => {
    rememberResetEmail(EMAIL);
    forgetResetEmail();

    expect(Object.keys(sessionStorage)).toEqual([]);
    expect(allStoredText()).not.toContain(EMAIL);
  });
});

describe("password reset — invalid or missing state", () => {
  it("returns an empty string when step 2 or 3 is opened cold", () => {
    expect(getResetEmail()).toBe("");
  });

  it("treats a cleared session as no email rather than throwing", () => {
    rememberResetEmail(EMAIL);
    sessionStorage.clear();
    expect(getResetEmail()).toBe("");
  });

  it("survives storage being unavailable (private mode) without throwing", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });
    const removeItem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    // The flow degrades to "no refresh resilience", never to a crash.
    expect(() => rememberResetEmail(EMAIL)).not.toThrow();
    expect(getResetEmail()).toBe("");
    expect(() => forgetResetEmail()).not.toThrow();

    setItem.mockRestore();
    getItem.mockRestore();
    removeItem.mockRestore();
  });
});

describe("password reset — auth API contract", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("sends the code as `token` plus `code` and `email`, and the emailed link as `token` alone", async () => {
    const post = vi.fn().mockResolvedValue({ data: { success: true } });

    vi.resetModules();
    vi.doMock("./apiClient", () => ({
      default: { post, get: vi.fn() },
      api: { post, get: vi.fn() },
      unwrap: (r) => r?.data?.data ?? null,
      errorMessage: () => "error",
      setSessionFlag: vi.fn(),
      clearSessionFlag: vi.fn(),
      hasSessionFlag: () => false,
    }));
    vi.doMock("./profileStore", () => ({ setProfile: vi.fn(), clearProfile: vi.fn() }));

    const { resetPassword, requestPasswordReset, verifyResetCode } = await import("./auth");

    await requestPasswordReset(EMAIL);
    expect(post).toHaveBeenCalledWith("/auth/forgot-password", { email: EMAIL });

    await verifyResetCode({ email: EMAIL, code: CODE });
    expect(post).toHaveBeenCalledWith("/auth/verify-reset-code", { email: EMAIL, code: CODE });

    // Step 3 via the typed code.
    await resetPassword({ code: CODE, email: EMAIL, password: "NewPass1!" });
    expect(post).toHaveBeenLastCalledWith("/auth/reset-password", {
      token: CODE,
      code: CODE,
      email: EMAIL,
      password: "NewPass1!",
    });

    // Step 3 via the emailed link.
    await resetPassword({ token: "emailed-token", password: "NewPass1!" });
    expect(post).toHaveBeenLastCalledWith("/auth/reset-password", {
      token: "emailed-token",
      password: "NewPass1!",
    });

    vi.doUnmock("./apiClient");
    vi.doUnmock("./profileStore");
  });
});
