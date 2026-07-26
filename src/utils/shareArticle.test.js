import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicArticleUrl, isShareable, shareArticle } from "./shareArticle";

/**
 * Share links must always point at the public reader and never at the editor —
 * handing a reader `/dashboard/write?edit=…` would be both broken and a leak
 * of an authoring surface.
 */

const ID = "6a646e52e31f34264a01f56e";

describe("publicArticleUrl", () => {
  it("builds an absolute /article/:id URL on the current origin", () => {
    expect(publicArticleUrl(ID)).toBe(`${window.location.origin}/article/${ID}`);
  });

  it("never produces an editor URL", () => {
    const url = publicArticleUrl(ID);
    expect(url).not.toContain("/dashboard/write");
    expect(url).not.toContain("edit=");
    expect(new URL(url).pathname).toBe(`/article/${ID}`);
  });
});

describe("isShareable", () => {
  it.each([
    ["Published", true],
    ["Draft", false],
    ["Archived", false],
    ["Scheduled", false],
  ])("%s -> %s", (status, expected) => {
    expect(isShareable({ status })).toBe(expected);
  });

  it("is false for a missing article", () => {
    expect(isShareable(undefined)).toBe(false);
    expect(isShareable(null)).toBe(false);
  });
});

describe("shareArticle", () => {
  beforeEach(() => {
    delete navigator.share;
    // jsdom implements no execCommand at all, so the legacy path needs a stub
    // to exist before a test can decide what it returns.
    document.execCommand = () => false;
  });

  it("uses the native share sheet with the public URL when one exists", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    navigator.share = share;

    const result = await shareArticle({ id: ID, title: "A title", excerpt: "An excerpt" });

    expect(share).toHaveBeenCalledWith({
      title: "A title",
      text: "An excerpt",
      url: `${window.location.origin}/article/${ID}`,
    });
    expect(result).toEqual({ ok: true, message: "Link shared" });
  });

  it("treats a dismissed share sheet as silent, not as a failure", async () => {
    const abort = new Error("dismissed");
    abort.name = "AbortError";
    navigator.share = vi.fn().mockRejectedValue(abort);

    const writeText = vi.fn();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const result = await shareArticle({ id: ID, title: "A title" });

    expect(result).toMatchObject({ ok: true, silent: true });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to the clipboard when the browser has no share sheet", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const result = await shareArticle({ id: ID, title: "A title" });

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/article/${ID}`);
    expect(result).toEqual({ ok: true, message: "Link copied to clipboard" });
  });

  it("falls back to the clipboard when the share sheet fails for a real reason", async () => {
    navigator.share = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    const result = await shareArticle({ id: ID, title: "A title" });

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/article/${ID}`);
    expect(result.ok).toBe(true);
  });

  it("reports failure when neither the clipboard nor the legacy copy works", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    vi.spyOn(document, "execCommand").mockReturnValue(false);

    const result = await shareArticle({ id: ID, title: "A title" });

    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/couldn't copy/i);
  });

  it("copies the public URL through the legacy path too — still never the editor", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("insecure origin")) },
      configurable: true,
    });

    let copied = "";
    vi.spyOn(document, "execCommand").mockImplementation(() => {
      copied = document.querySelector("textarea")?.value ?? "";
      return true;
    });

    const result = await shareArticle({ id: ID, title: "A title" });

    expect(result.ok).toBe(true);
    expect(copied).toBe(`${window.location.origin}/article/${ID}`);
    expect(copied).not.toContain("/dashboard/write");
    // The scratch textarea is cleaned up.
    expect(document.querySelector("textarea")).toBeNull();
  });
});
