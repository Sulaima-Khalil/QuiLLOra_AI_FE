import { describe, it, expect, afterEach } from "vitest";
import { applyMeta, absoluteUrl, clampDescription, SITE } from "./seo";

/**
 * The metadata writer.
 *
 * The rules that matter: a canonical is only ever emitted for something
 * genuinely public, nothing is fabricated, and a page's tags do not survive
 * into the next page.
 */

const meta = (selector) => document.head.querySelector(selector)?.getAttribute("content");
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute("href");
const jsonLd = () => {
  const node = document.getElementById("seo-json-ld");
  return node ? JSON.parse(node.textContent) : null;
};

let cleanup;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("applyMeta — basics", () => {
  it("sets the title, description and canonical", () => {
    cleanup = applyMeta({
      title: "A Page",
      description: "What the page is about.",
      canonical: "https://example.test/a-page",
    });

    expect(document.title).toBe("A Page");
    expect(meta('meta[name="description"]')).toBe("What the page is about.");
    expect(canonical()).toBe("https://example.test/a-page");
  });

  it("mirrors title and description into Open Graph and Twitter", () => {
    cleanup = applyMeta({ title: "A Page", description: "Summary." });

    expect(meta('meta[property="og:title"]')).toBe("A Page");
    expect(meta('meta[property="og:description"]')).toBe("Summary.");
    expect(meta('meta[name="twitter:title"]')).toBe("A Page");
    expect(meta('meta[name="twitter:description"]')).toBe("Summary.");
    expect(meta('meta[property="og:site_name"]')).toBe(SITE.name);
  });

  it("claims a large image card only when there is an image", () => {
    cleanup = applyMeta({ title: "No image" });
    expect(meta('meta[name="twitter:card"]')).toBe("summary");
    cleanup();

    cleanup = applyMeta({ title: "With image", image: "https://cdn.test/cover.png" });
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(meta('meta[property="og:image"]')).toBe("https://cdn.test/cover.png");
  });

  it("omits tags whose values are unknown rather than emitting empty ones", () => {
    cleanup = applyMeta({ title: "Bare" });

    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:image"]')).toBeNull();
    expect(canonical()).toBeUndefined();
  });

  it("removes everything it added on cleanup", () => {
    const before = document.title;

    cleanup = applyMeta({
      title: "Temporary",
      description: "Gone soon.",
      canonical: "https://example.test/x",
      jsonLd: { "@type": "WebSite" },
    });
    cleanup();
    cleanup = undefined;

    expect(document.title).toBe(before);
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.getElementById("seo-json-ld")).toBeNull();
  });
});

describe("applyMeta — indexability", () => {
  it("emits no robots tag for an ordinary indexable page", () => {
    cleanup = applyMeta({ title: "Public", canonical: "https://example.test/p" });
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("emits noindex when asked", () => {
    cleanup = applyMeta({ title: "Private", noindex: true });
    expect(meta('meta[name="robots"]')).toBe("noindex, nofollow");
  });

  it("never emits a canonical for a noindex page", () => {
    cleanup = applyMeta({ title: "Private", noindex: true });
    expect(canonical()).toBeUndefined();
  });

  it("clears a stale canonical when moving to a page that must not be indexed", () => {
    cleanup = applyMeta({ title: "Public", canonical: "https://example.test/public" });
    expect(canonical()).toBe("https://example.test/public");
    cleanup();

    // A leftover canonical would attribute the private page to the public URL.
    cleanup = applyMeta({ title: "Private", noindex: true });
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

describe("applyMeta — structured data", () => {
  it("emits exactly the object it is given", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Real Headline",
      datePublished: "2026-01-01T00:00:00.000Z",
    };

    cleanup = applyMeta({ title: "Article", jsonLd: data });

    expect(jsonLd()).toEqual(data);
  });

  it("fabricates no ratings or review counts", () => {
    cleanup = applyMeta({
      title: "Article",
      jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: "H" },
    });

    const raw = document.getElementById("seo-json-ld").textContent;
    expect(raw).not.toMatch(/aggregateRating|reviewCount|ratingValue/);
  });

  it("replaces rather than accumulating on repeated application", () => {
    cleanup = applyMeta({ title: "One", jsonLd: { "@type": "WebSite" } });
    cleanup();
    cleanup = applyMeta({ title: "Two", jsonLd: { "@type": "Article" } });

    expect(document.querySelectorAll("#seo-json-ld")).toHaveLength(1);
    expect(jsonLd()["@type"]).toBe("Article");
  });
});

describe("applyMeta — article tags", () => {
  it("emits published time, author, section and tags", () => {
    cleanup = applyMeta({
      title: "A",
      type: "article",
      article: {
        publishedTime: "2026-01-01T00:00:00.000Z",
        author: "Alex Rivera",
        section: "Engineering",
        tags: ["Systems", "Scale"],
      },
    });

    expect(meta('meta[property="og:type"]')).toBe("article");
    expect(meta('meta[property="article:published_time"]')).toBe("2026-01-01T00:00:00.000Z");
    expect(meta('meta[property="article:author"]')).toBe("Alex Rivera");
    expect(meta('meta[property="article:section"]')).toBe("Engineering");

    const tags = [...document.head.querySelectorAll('meta[property="article:tag"]')].map((el) =>
      el.getAttribute("content"),
    );
    expect(tags).toEqual(["Systems", "Scale"]);
  });

  it("caps the tag list so the head does not bloat", () => {
    cleanup = applyMeta({
      title: "A",
      article: { tags: ["a", "b", "c", "d", "e", "f", "g", "h"] },
    });

    expect(document.head.querySelectorAll('meta[property="article:tag"]')).toHaveLength(6);
  });
});

describe("helpers", () => {
  it("builds absolute URLs on the current origin", () => {
    expect(absoluteUrl("/article/abc")).toBe(`${window.location.origin}/article/abc`);
  });

  it("leaves an already-absolute URL alone", () => {
    expect(absoluteUrl("https://cdn.test/x.png")).toBe("https://cdn.test/x.png");
  });

  it("strips markup and collapses whitespace in descriptions", () => {
    expect(clampDescription("<p>Hello   <b>there</b></p>\n\nfriend")).toBe("Hello there friend");
  });

  it("truncates long descriptions with an ellipsis", () => {
    const result = clampDescription("x".repeat(300));
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith("…")).toBe(true);
  });

  it("handles missing text", () => {
    expect(clampDescription(undefined)).toBe("");
  });
});
