import tealUrl from "../../assets/quillora-mark.svg";
import goldUrl from "../../assets/quillora-mark-gold.svg";

/**
 * QuiLLora AI brand mark.
 *
 * The artwork lives in src/assets/quillora-mark.svg — the single source of
 * truth, also referenced as the favicon from index.html. It is imported rather
 * than served from public/ so Vite rewrites the URL correctly under the
 * project's relative `base`, which a hardcoded "/quillora.svg" would break on
 * nested routes like /dashboard/write.
 *
 * Four cleanups were applied to the exported trace: a `viewBox` (the export had
 * only fixed width/height, so it could not scale), removal of its opaque white
 * canvas rectangle (a white box on the dark surfaces), removal of a stray 8×501
 * grey line traced from the source image's card border, and a viewBox cropped
 * to the artwork so the mark isn't ringed by ~10% dead padding beside text.
 *
 * `tone="mono"` fades the mark for watermark placements; the artwork is flat
 * colour, so it cannot take `currentColor` the way an inline SVG would.
 *
 * `color="gold"` swaps in the gold colourway — the same artwork with its teal
 * fills hue-shifted. Nothing uses it right now: teal is live everywhere while
 * the colour decision is still open. Drop the gold import and its asset if the
 * answer turns out to be teal.
 */

// The cropped artwork is 459×411, not square — keep it from squashing.
const ASPECT = 411 / 459;

const SOURCES = { teal: tealUrl, gold: goldUrl };

export default function QuilloraMark({
  size = 36,
  tone = "brand",
  color = "teal",
  title,
  className,
  style,
}) {
  return (
    <img
      src={SOURCES[color] || tealUrl}
      width={size}
      height={Math.round(size * ASPECT)}
      alt={title || ""}
      aria-hidden={title ? undefined : true}
      className={className}
      draggable={false}
      style={{
        display: "block",
        flexShrink: 0,
        ...(tone === "mono" ? { opacity: 0.09 } : null),
        ...style,
      }}
    />
  );
}
