/**
 * Sharing an article's public reader URL.
 *
 * One place builds the link so nothing has to hand-assemble `/article/:id`,
 * and nothing ever hands a reader an editor URL.
 */

/** Absolute URL of the public reader page. */
export const publicArticleUrl = (id) => `${window.location.origin}/article/${id}`;

/** Only published articles have a public page worth sharing. */
export const isShareable = (article) => article?.status === "Published";

/** Last resort for browsers without the async clipboard (non-secure origins). */
const legacyCopy = (text) => {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(field);
  }
};

/**
 * Shares the public link: the native share sheet where the browser offers
 * one, the clipboard otherwise.
 *
 * @returns {Promise<{ ok: boolean, silent?: boolean, message: string }>}
 *   `silent` marks a share sheet the user dismissed — not a failure, and not
 *   worth a toast either.
 */
export const shareArticle = async ({ id, title, excerpt }) => {
  const url = publicArticleUrl(id);

  if (navigator.share) {
    try {
      await navigator.share({ title, text: excerpt || title, url });
      return { ok: true, message: "Link shared" };
    } catch (error) {
      if (error?.name === "AbortError") return { ok: true, silent: true, message: "" };
      // Anything else (unsupported payload, permission) falls back to copying.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { ok: true, message: "Link copied to clipboard" };
  } catch {
    return legacyCopy(url)
      ? { ok: true, message: "Link copied to clipboard" }
      : { ok: false, message: "Couldn't copy the link — copy it from the address bar." };
  }
};
