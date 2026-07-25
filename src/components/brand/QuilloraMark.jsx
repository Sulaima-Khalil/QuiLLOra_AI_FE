/**
 * QuiLLora AI brand mark — an open "Q" ring holding a quill whose barbs
 * dissolve into circuit traces, over an ink-flow ribbon.
 *
 * Pure SVG (no MUI) so it drops into the themed pages and the plain-CSS auth
 * screens alike, and stays crisp at every size.
 *
 * `variant`:
 *   "auto"    — full detail at 40px and up, simplified below (default)
 *   "full"    — ring + ribbon + feather barbs + five circuit traces
 *   "compact" — ring + feather + three traces; stays legible down to ~20px
 *
 * `tone`:
 *   "brand" — teal gradients; the standard mark on a dark surface
 *   "mono"  — inherits `currentColor`, for watermarks and tinted placements
 */
export default function QuilloraMark({
  size = 36,
  variant = "auto",
  tone = "brand",
  title,
  className,
  style,
}) {
  const compact = variant === "compact" || (variant === "auto" && size < 40);
  const mono = tone === "mono";

  // Ids are namespaced per instance so several marks on one page can't clash.
  const uid = `qll-${size}-${variant}-${tone}`;
  const ring = mono ? "currentColor" : `url(#${uid}-ring)`;
  const ribbon = mono ? "currentColor" : `url(#${uid}-ribbon)`;
  const plume = mono ? "currentColor" : `url(#${uid}-plume)`;
  const wire = mono ? "currentColor" : "#2dd4bf";
  const node = mono ? "currentColor" : "#5eead4";
  const ink = mono ? "transparent" : "rgba(11,18,32,0.5)";

  const traces = [
    { d: "M92 40H100L108 32H113", cx: 117, cy: 32, r: 3.4 },
    { d: "M96 52H104L110 46H115", cx: 119, cy: 46, r: 3.8 },
    { d: "M90 62H98L104 56H109", cx: 113, cy: 56, r: 3.2 },
    { d: "M84 72H96L102 66H107", cx: 111, cy: 66, r: 3.6 },
    { d: "M78 82H90L96 76H99", cx: 103, cy: 76, r: 3 },
  ];
  const shown = compact ? traces.slice(1, 4) : traces;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title && <title>{title}</title>}

      {!mono && (
        <defs>
          <linearGradient id={`${uid}-ring`} x1="18" y1="18" x2="104" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7af0dd" />
            <stop offset="0.45" stopColor="#2dd4bf" />
            <stop offset="1" stopColor="#0c8375" />
          </linearGradient>
          <linearGradient id={`${uid}-ribbon`} x1="42" y1="100" x2="120" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0f9e8c" />
            <stop offset="1" stopColor="#7af0dd" />
          </linearGradient>
          <linearGradient id={`${uid}-plume`} x1="88" y1="24" x2="40" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c3d1e2" />
          </linearGradient>
        </defs>
      )}

      {/* The Q ring, left open on the right so the quill breaks out of it */}
      <path d="M89 100A44 44 0 1 1 98 36" stroke={ring} strokeWidth="11" strokeLinecap="round" />

      {/* Ink-flow ribbon sweeping through the lower right */}
      <path
        d="M42 90C60 116 96 118 120 76C100 100 66 98 52 78Z"
        fill={ribbon}
        opacity={mono ? 0.85 : 1}
      />

      {/* Circuit traces spilling out from behind the plume */}
      <g stroke={wire} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
        {shown.map((t) => (
          <path key={t.d} d={t.d} />
        ))}
      </g>
      <g fill={node}>
        {shown.map((t) => (
          <g key={`${t.cx}-${t.cy}`}>
            <circle cx={t.cx} cy={t.cy} r={t.r + 2.6} opacity="0.22" />
            <circle cx={t.cx} cy={t.cy} r={t.r} />
          </g>
        ))}
      </g>

      {/* Quill: plume, barbs, shaft, ferrule, nib */}
      <path
        d="M88 24C98 44 84 66 54 80C50 64 64 36 88 24Z"
        fill={plume}
        stroke={ink}
        strokeWidth="2.2"
      />
      {!compact && (
        <g stroke={mono ? "currentColor" : "#0b1220"} strokeWidth="1.8" strokeLinecap="round" opacity={mono ? 0.3 : 0.55}>
          <path d="M78.8 37L88.5 34.5" />
          <path d="M72.5 45.5L85.1 42.2" />
          <path d="M66 54L79.5 50.4" />
          <path d="M59.5 62.5L72.1 59.2" />
          <path d="M53.1 71L63.7 68.2" />
        </g>
      )}
      <path
        d="M87 26C74 44 58 64 44 87"
        stroke={mono ? "currentColor" : "#0b1220"}
        strokeWidth="2.3"
        strokeLinecap="round"
        opacity={mono ? 0.4 : 0.6}
      />
      <path d="M40 90L46 94L32 103Z" fill={plume} stroke={ink} strokeWidth="2" />
      <rect x="38" y="85.8" width="11" height="4.4" rx="2.2" fill={mono ? "currentColor" : "#ffffff"} transform="rotate(40 43.5 88)" />
    </svg>
  );
}
