/**
 * Document metadata for the public pages.
 *
 * IMPORTANT — what this can and cannot do.
 *
 * The app is a client-rendered SPA: Vercel rewrites every path to the same
 * `index.html`, and the tags below are written by React after that HTML has
 * loaded. Search crawlers that execute JavaScript (Googlebot) will eventually
 * see them. Social preview crawlers — Facebook, LinkedIn, Slack, WhatsApp,
 * X — do NOT run JavaScript, so they only ever see the static `index.html`.
 *
 * So this module genuinely improves browser tabs, bookmarks, history and
 * JS-rendering search engines. It does NOT make per-article link previews
 * work. That needs HTML with the tags already in it — prerendering, an edge
 * function, or SSR. See docs/SEO.md.
 */

export const SITE = Object.freeze({
  name: "QuiLLora AI",
  description:
    "QuiLLora AI — an intelligent editorial workspace to draft, refine, and publish.",
  twitter: "@quillora",
  locale: "en_US",
});

/** Marks every tag this module owns, so it can clean up only its own. */
const MANAGED = "data-seo-managed";

/** The site origin. Falls back to the deployed host during tests/SSR-less builds. */
export const siteOrigin = () =>
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "";

/** Absolute URL for a path, used for canonicals and og:url. */
export const absoluteUrl = (path = "/") => {
  const origin = siteOrigin();
  if (!path.startsWith("/")) return path; // already absolute
  return `${origin}${path}`;
};

const upsert = (selector, create) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = create();
    element.setAttribute(MANAGED, "");
    document.head.appendChild(element);
  }

  return element;
};

const setMetaByName = (name, content) => {
  if (!content) return;
  const tag = upsert(`meta[name="${name}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("name", name);
    return el;
  });
  tag.setAttribute("content", content);
};

const setMetaByProperty = (property, content) => {
  if (!content) return;
  const tag = upsert(`meta[property="${property}"]`, () => {
    const el = document.createElement("meta");
    el.setAttribute("property", property);
    return el;
  });
  tag.setAttribute("content", content);
};

const setCanonical = (href) => {
  const existing = document.head.querySelector('link[rel="canonical"]');

  // No canonical is correct for a page that should not be indexed; a wrong
  // one is worse than none, so any stale link is removed rather than left.
  if (!href) {
    if (existing) existing.remove();
    return;
  }

  const link = upsert('link[rel="canonical"]', () => {
    const el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    return el;
  });
  link.setAttribute("href", href);
};

const JSON_LD_ID = "seo-json-ld";

const setJsonLd = (data) => {
  document.getElementById(JSON_LD_ID)?.remove();
  if (!data) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = JSON_LD_ID;
  script.setAttribute(MANAGED, "");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Applies a page's metadata.
 *
 * @param {object} meta
 * @param {string} meta.title            Full document title.
 * @param {string} [meta.description]
 * @param {string} [meta.canonical]      Absolute URL, or omitted when not indexable.
 * @param {boolean} [meta.noindex]       Ask crawlers not to index this page.
 * @param {string} [meta.type]           Open Graph type. Defaults to "website".
 * @param {string} [meta.image]          Absolute image URL. Omitted when unknown.
 * @param {object} [meta.article]        `{ publishedTime, modifiedTime, author, section, tags }`
 * @param {object} [meta.jsonLd]         Structured data, built from real values only.
 * @returns {() => void} Cleanup that restores the static defaults.
 */
export const applyMeta = ({
  title,
  description,
  canonical,
  noindex = false,
  type = "website",
  image,
  article,
  jsonLd,
} = {}) => {
  const previousTitle = document.title;

  if (title) document.title = title;

  setMetaByName("description", description);
  // Only ever written to opt OUT. Absence means the default (indexable), and
  // writing "index,follow" everywhere would be noise.
  setMetaByName("robots", noindex ? "noindex, nofollow" : undefined);

  setMetaByProperty("og:site_name", SITE.name);
  setMetaByProperty("og:locale", SITE.locale);
  setMetaByProperty("og:type", type);
  setMetaByProperty("og:title", title);
  setMetaByProperty("og:description", description);
  setMetaByProperty("og:url", canonical);
  setMetaByProperty("og:image", image);

  // summary_large_image would promise a card image we do not always have.
  setMetaByName("twitter:card", image ? "summary_large_image" : "summary");
  setMetaByName("twitter:title", title);
  setMetaByName("twitter:description", description);
  setMetaByName("twitter:image", image);

  if (article) {
    setMetaByProperty("article:published_time", article.publishedTime);
    setMetaByProperty("article:modified_time", article.modifiedTime);
    setMetaByProperty("article:author", article.author);
    setMetaByProperty("article:section", article.section);
    (article.tags ?? []).slice(0, 6).forEach((tag) => {
      const el = document.createElement("meta");
      el.setAttribute("property", "article:tag");
      el.setAttribute("content", tag);
      el.setAttribute(MANAGED, "");
      document.head.appendChild(el);
    });
  }

  setCanonical(canonical);
  setJsonLd(jsonLd);

  return () => {
    document.title = previousTitle;
    document.head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove());
  };
};

/** Trims text to a length search results and social cards will not truncate. */
export const clampDescription = (text, max = 160) => {
  const clean = String(text ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
};
