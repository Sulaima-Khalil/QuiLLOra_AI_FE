/**
 * Default titles for new articles.
 *
 * The backend does not require titles to be unique — only slugs are, per
 * author, and `uniqueSlug` already resolves collisions by appending `-2`,
 * `-3`. So the sequence below is a convenience for the writer, not a
 * constraint: it stops a workspace filling up with a dozen identical
 * "Untitled" rows that are impossible to tell apart in My Articles.
 *
 * The source of truth is the author's real article list from the API, not
 * localStorage and not a counter held in the page. Two tabs opened against the
 * same loaded list can still land on the same name, which is harmless — the
 * server accepts duplicate titles and gives each its own slug.
 */

export const BASE_TITLE = "Untitled";

/** `Untitled`, `Untitled 2`, `Untitled 3`, … */
const UNTITLED_PATTERN = /^Untitled(?:\s+(\d+))?$/i;

/**
 * The lowest unused name in the sequence.
 *
 * Gaps are filled rather than always appending: deleting "Untitled 2" of three
 * should let the next new article reuse that name instead of jumping to 4.
 *
 * @param {Array<{title?: string}>} articles The author's articles.
 * @returns {string}
 */
export const nextUntitledTitle = (articles = []) => {
  const taken = new Set();

  for (const article of articles) {
    const match = UNTITLED_PATTERN.exec(String(article?.title ?? "").trim());
    if (!match) continue;

    // "Untitled" is position 1; "Untitled 2" is position 2.
    taken.add(match[1] ? Number(match[1]) : 1);
  }

  let position = 1;
  while (taken.has(position)) position += 1;

  return position === 1 ? BASE_TITLE : `${BASE_TITLE} ${position}`;
};

/**
 * Whether a title is still one of the generated defaults.
 *
 * Used to decide if a default may be replaced — an author who has typed their
 * own title must never have it overwritten, including by a generated one.
 */
export const isDefaultTitle = (title) => UNTITLED_PATTERN.test(String(title ?? "").trim());
