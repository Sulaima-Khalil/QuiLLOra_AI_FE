/**
 * Motion preference, for the animations CSS cannot reach.
 *
 * The global `prefers-reduced-motion` block in index.css forces
 * `scroll-behavior: auto`, but that only governs scrolling the *stylesheet*
 * initiates. An explicit `scrollIntoView({ behavior: "smooth" })` passed from
 * JavaScript wins over it, so a user who asked for less motion still got a
 * long animated scroll from the testimonial carousel and the editor outline.
 */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `scrollIntoView`, honouring the motion preference.
 *
 * Read at call time rather than cached: the preference can change while the
 * app is open, and a page that has to be reloaded to respect it has not really
 * respected it.
 *
 * @param {Element | null | undefined} element
 * @param {ScrollIntoViewOptions} [options] Everything except `behavior`, which
 *   is decided here.
 */
export const scrollIntoViewGently = (element, options = {}) => {
  element?.scrollIntoView({
    ...options,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};
