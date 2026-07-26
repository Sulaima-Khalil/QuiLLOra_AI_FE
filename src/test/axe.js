import axe from "axe-core";

/**
 * Runs axe-core over a rendered container and returns its violations.
 *
 * Two rules are switched off, and only these two:
 *
 *   - `color-contrast` needs real layout and a canvas to sample pixels. jsdom
 *     has neither, so axe either skips it or reports it as incomplete —
 *     never as a pass. Contrast was checked by computing the ratios against
 *     the palette instead; see the notes in theme/muiTheme.js.
 *   - `region` wants every node inside a landmark. A test renders a fragment,
 *     not a document, so it fires on the harness rather than on the app.
 *
 * Nothing else is suppressed. A rule that fails here is a real finding.
 */
export const axeViolations = async (container, { rules = {} } = {}) => {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
      ...rules,
    },
  });

  return results.violations;
};

/** Formats violations into something readable when an expectation fails. */
export const describeViolations = (violations) =>
  violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.map((n) => n.html).join("\n    ")}`)
    .join("\n\n");

/** `expect(await noAxeViolations(container)).toEqual([])` reads badly; this reads well. */
export const expectNoViolations = async (container, options) => {
  const violations = await axeViolations(container, options);
  if (violations.length > 0) {
    throw new Error(`Accessibility violations found:\n\n${describeViolations(violations)}`);
  }
};
