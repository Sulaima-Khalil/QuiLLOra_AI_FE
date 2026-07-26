/**
 * The skip link's destination.
 *
 * Kept out of SkipLink.jsx so that file exports a component and nothing else —
 * mixing constants into a component module breaks Vite's fast refresh, which
 * is what `react-refresh/only-export-components` is guarding.
 */
export const MAIN_CONTENT_ID = "main-content";

/**
 * Spread onto the element the skip link points at.
 *
 * `tabIndex={-1}` makes it a valid focus target without adding a tab stop.
 * Without it the browser scrolls the region into view but leaves focus on the
 * skip link, so the next Tab goes straight back into the navigation the user
 * just asked to skip.
 *
 * The outline is suppressed because focus lands here programmatically: a ring
 * drawn around a whole page region reads as an error rather than as a cursor.
 */
export const mainContentProps = (id = MAIN_CONTENT_ID) => ({
  id,
  tabIndex: -1,
  sx: { outline: "none" },
});
