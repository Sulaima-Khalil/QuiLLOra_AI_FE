# SEO: what works, what does not, and why

## Architecture

QuiLLora is a **client-rendered SPA**: Vite builds a single `index.html`, React
mounts into `<div id="root">`, and `vercel.json` rewrites every path to that one
file. There is no SSR, no prerendering and no edge function.

That single fact decides everything below.

## What a crawler actually receives

| Consumer | Runs JavaScript | Sees per-page metadata |
|---|---|---|
| Googlebot | Yes, on a second render pass | **Yes**, with a delay of hours to days |
| Bingbot | Partially | Unreliable |
| Facebook / LinkedIn / Slack / WhatsApp / X | **No** | **No — only `index.html`** |
| Browser tab, history, bookmarks | Yes | Yes, immediately |

So the runtime metadata in `src/utils/seo.js` genuinely improves tab titles,
bookmarks, and eventually Google. **It does not make per-article link previews
work.** Sharing an article into Slack shows the generic site card from
`index.html`, not the article's own title and excerpt.

This is a property of the architecture, not a bug in the implementation, and no
amount of client-side code changes it.

## Fixing link previews — smallest correct options

Ordered by effort. All are out of scope for the current task.

1. **Vercel Edge Middleware (recommended).** Detect crawler user agents and, for
   `/article/:id` and `/author/:id` only, fetch the public API and return
   `index.html` with the OG tags substituted. Humans keep the SPA untouched.
   Roughly one middleware file, no framework change, no build change.
2. **Prerendering at build.** A plugin renders known routes to static HTML.
   Works for the landing page; cannot cover articles created after the build.
3. **A dedicated metadata route.** Serve `/article/:id` from a serverless
   function that returns real HTML and hands off to the SPA.
4. **Migrate to a framework with SSR** (Next.js, Remix). Correct, and by far the
   largest change.

Option 1 is the smallest thing that actually fixes previews.

## Sitemap

`vite.config.js` emits `sitemap.xml` at build **only when `VITE_SITE_URL` is
set** — a sitemap needs absolute URLs, and a guessed domain is rejected by
search engines as a cross-submission.

It lists the landing page and nothing else. Articles and author pages are
created by users after the build, so a build-time generator cannot know them.
Listing them requires a generator with database access. The recommended shape:

- A backend `GET /sitemap.xml` reusing the same published-and-public filter
  Discover already applies, plus active users with published work.
- A `vercel.json` rewrite mapping `/sitemap.xml` to it.

That keeps one source of truth for "what is public" and cannot drift from the
article visibility rules. **Never** add `/dashboard/*` or any credential route.

## Canonical URLs

- Published article → `/article/:id`
- Public author → `/author/:username` when a username exists, otherwise
  `/author/:id`, so one person does not compete with themselves in the index
- Landing → `/`

A canonical is emitted **only** for content that is genuinely public. Drafts,
unknown ids and loading states emit `robots: noindex, nofollow` and **no**
canonical at all — a canonical for a page a crawler cannot see is worse than
none, and it would leak a private title.

## Structured data

Emitted from real API values only, with absent fields omitted rather than
filled in:

- `WebSite` on the landing page (static, no backend data needed)
- `Article` on a published article — headline, description, datePublished,
  dateModified, author, wordCount, keywords
- `Person` on a public author page — name, description, jobTitle, image

No `aggregateRating`, no `reviewCount`, no invented dates. Those require real
review data, which does not exist.

## PWA status

There is a web manifest with name, theme colour, background colour and an SVG
icon, plus `theme-color` and `apple-mobile-web-app-title`. This is **mobile and
browser-chrome metadata, not a PWA**: there is no service worker, so the app
does not work offline and is not installable. `display` is `"browser"` to avoid
implying otherwise, and there is no install prompt.

Making it a real PWA needs a service worker and PNG icons at 192px and 512px.

## Known gaps

- No `og:image` anywhere. The brand mark is an SVG, which crawlers will not
  render, and no PNG social card exists. Articles use their own `coverImage`
  when the backend supplies an absolute URL.
- `VITE_SITE_URL` is unset, so no sitemap is currently emitted.
- The sitemap cannot list articles or authors (above).
- Per-article social previews do not work (above).
