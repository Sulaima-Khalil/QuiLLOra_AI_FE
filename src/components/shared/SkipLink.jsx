import { MAIN_CONTENT_ID } from "./skipTarget";

/**
 * "Skip to main content" — the first focusable element on a page.
 *
 * A plain anchor, not a router <Link>: the target is a fragment on the page
 * already rendered, and routing to it would push a history entry for what is
 * really just a focus move. Browsers move focus to the fragment target on
 * their own provided that target can hold focus, which is why the receiving
 * element carries `tabIndex={-1}` — see `mainContentProps` in ./skipTarget.
 *
 * Hidden off-screen until focused rather than `display: none`, so it stays in
 * the tab order. The styling lives in index.css as `.skip-link`.
 */
export default function SkipLink({ targetId = MAIN_CONTENT_ID, children = "Skip to main content" }) {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      {children}
    </a>
  );
}
