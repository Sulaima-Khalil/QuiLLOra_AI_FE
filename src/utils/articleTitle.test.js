import { describe, it, expect } from "vitest";
import { nextUntitledTitle, isDefaultTitle, BASE_TITLE } from "./articleTitle";

/**
 * Default titles for new articles.
 *
 * Derived from the author's real article list, which comes from the API — not
 * from localStorage and not from a counter living in the page.
 */

const titles = (...list) => list.map((title) => ({ title }));

describe("nextUntitledTitle", () => {
  it("starts at the bare name for an empty workspace", () => {
    expect(nextUntitledTitle([])).toBe("Untitled");
    expect(nextUntitledTitle()).toBe(BASE_TITLE);
  });

  it("continues the sequence", () => {
    expect(nextUntitledTitle(titles("Untitled"))).toBe("Untitled 2");
    expect(nextUntitledTitle(titles("Untitled", "Untitled 2"))).toBe("Untitled 3");
    expect(nextUntitledTitle(titles("Untitled", "Untitled 2", "Untitled 3"))).toBe("Untitled 4");
  });

  it("fills a gap rather than always appending", () => {
    // "Untitled 2" was deleted; the next article should reuse that name.
    expect(nextUntitledTitle(titles("Untitled", "Untitled 3"))).toBe("Untitled 2");
  });

  it("ignores the author's own titles", () => {
    expect(nextUntitledTitle(titles("Designing Resilient Systems", "Notes on Typography"))).toBe(
      "Untitled",
    );
  });

  it("does not treat a title that merely starts with Untitled as part of the sequence", () => {
    expect(nextUntitledTitle(titles("Untitled thoughts on scale"))).toBe("Untitled");
    expect(nextUntitledTitle(titles("Untitled-2"))).toBe("Untitled");
  });

  it("is case-insensitive and tolerant of stray whitespace", () => {
    expect(nextUntitledTitle(titles("  untitled  "))).toBe("Untitled 2");
    expect(nextUntitledTitle(titles("UNTITLED", "Untitled   2"))).toBe("Untitled 3");
  });

  it("survives malformed entries", () => {
    expect(nextUntitledTitle([{}, { title: null }, { title: "Untitled" }])).toBe("Untitled 2");
  });

  it("is stable — the same list always yields the same name", () => {
    const list = titles("Untitled", "Untitled 3");
    expect(nextUntitledTitle(list)).toBe(nextUntitledTitle(list));
  });
});

describe("isDefaultTitle", () => {
  it("recognises generated defaults", () => {
    expect(isDefaultTitle("Untitled")).toBe(true);
    expect(isDefaultTitle("Untitled 7")).toBe(true);
  });

  it("does not claim an author's title", () => {
    expect(isDefaultTitle("Designing Resilient Systems")).toBe(false);
    expect(isDefaultTitle("Untitled thoughts")).toBe(false);
    expect(isDefaultTitle("")).toBe(false);
  });
});
