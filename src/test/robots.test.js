import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * robots.txt and the manifest are static files, so they are asserted as text.
 *
 * The rules that matter are exclusions: nothing private, per-user, or
 * credential-related may ever become crawlable.
 */

const publicFile = (name) => readFileSync(resolve(process.cwd(), "public", name), "utf8");

describe("robots.txt", () => {
  const robots = publicFile("robots.txt");

  it("exists and applies to every crawler", () => {
    expect(robots).toMatch(/^User-agent:\s*\*/m);
  });

  it("allows the public landing page", () => {
    expect(robots).toMatch(/^Allow:\s*\/$/m);
  });

  it.each([
    ["the authenticated dashboard", "/dashboard/"],
    ["login", "/login"],
    ["register", "/register"],
    ["forgot password", "/forgot-password"],
    ["reset code entry", "/verify-reset-code"],
    ["reset password", "/reset-password"],
    ["reset success", "/reset-success"],
    ["email verification", "/verify-email"],
  ])("disallows %s", (_label, path) => {
    expect(robots).toMatch(new RegExp(`^Disallow:\\s*${path.replace(/\//g, "\\/")}\\s*$`, "m"));
  });

  it("disallows search result URLs, which are near-duplicates", () => {
    expect(robots).toMatch(/^Disallow:\s*\/\*\?q=/m);
  });

  it("does not disallow public articles or author pages", () => {
    expect(robots).not.toMatch(/^Disallow:\s*\/article/m);
    expect(robots).not.toMatch(/^Disallow:\s*\/author/m);
  });

  it("points at a sitemap", () => {
    expect(robots).toMatch(/^Sitemap:\s*\/sitemap\.xml$/m);
  });
});

describe("sitemap", () => {
  it("ships no static sitemap — it is emitted at build only when the domain is known", () => {
    // A sitemap needs absolute URLs; a guessed domain is rejected as a
    // cross-submission, so none is committed. See vite.config.js.
    expect(existsSync(resolve(process.cwd(), "public", "sitemap.xml"))).toBe(false);
  });
});

describe("web manifest", () => {
  const manifest = JSON.parse(publicFile("site.webmanifest"));

  it("describes the site", () => {
    expect(manifest.name).toBe("QuiLLora AI");
    expect(manifest.short_name).toBe("QuiLLora");
    expect(manifest.theme_color).toBe("#0b1220");
  });

  it("references an icon that actually exists", () => {
    expect(manifest.icons.length).toBeGreaterThan(0);

    for (const icon of manifest.icons) {
      const file = icon.src.replace(/^\//, "");
      expect(existsSync(resolve(process.cwd(), "public", file))).toBe(true);
    }
  });

  it("does not claim to be an installable app", () => {
    // No service worker exists, so `standalone` would be a false promise.
    expect(manifest.display).toBe("browser");
  });
});

describe("index.html — the only HTML a social crawler sees", () => {
  const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

  it("carries generic site-level Open Graph tags as a fallback", () => {
    expect(html).toMatch(/property="og:title"/);
    expect(html).toMatch(/property="og:description"/);
    expect(html).toMatch(/property="og:site_name"/);
    expect(html).toMatch(/name="twitter:card"/);
  });

  it("carries no page-specific content, which would be wrong on every other URL", () => {
    expect(html).not.toMatch(/article:published_time/);
    expect(html).not.toMatch(/rel="canonical"/);
  });

  it("links the manifest and mobile chrome metadata", () => {
    expect(html).toMatch(/rel="manifest"/);
    expect(html).toMatch(/name="theme-color"/);
    expect(html).toMatch(/name="color-scheme"/);
  });

  it("uses stable public icon paths rather than source paths", () => {
    expect(html).toMatch(/href="\/quillora-mark\.svg"/);
    expect(html).not.toMatch(/\.\/src\/assets/);
  });
});
