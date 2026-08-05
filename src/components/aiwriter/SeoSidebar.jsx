import { Globe, FileDown, Rocket } from "lucide-react";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SeoSidebar({
  score = 80,
  keywordDensity = "1.8% (Target: 1.5 - 2.5%)",
  keywordDensityPct = 70,
  readability = 72,
  readabilityLabel = "72/100 · Easy",
  revisions = [
    { title: "Current Draft", sub: "just now · You", current: true },
    { title: "Autosave", sub: "5 mins ago · You", current: false },
  ],
  onPublishToWeb,
  onExport,
  onPublishNow,
  publishing,
}) {
  const offset = CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, score)) / 100);

  return (
    <div className="aiw-sidebar is-right">
      <div className="aiw-seo-head">
        <div className="aiw-section-label">SEO Insights</div>
        <span className="aiw-chip">{score >= 80 ? "Optimized" : score >= 50 ? "Fair" : "Needs work"}</span>
      </div>

      <div className="aiw-score-wrap">
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx="52" cy="52" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="52"
            cy="52"
            r={RADIUS}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 52 52)"
          />
          <text x="52" y="58" textAnchor="middle" className="aiw-score-num">
            {score}
          </text>
        </svg>
        <div className="aiw-score-label">Content Score</div>
      </div>

      <div className="aiw-metric">
        <div className="aiw-metric-row">
          <span>Keyword Density</span>
          <span>{keywordDensity}</span>
        </div>
        <div className="aiw-bar-track">
          <div className="aiw-bar-fill" style={{ width: `${keywordDensityPct}%` }} />
        </div>
      </div>

      <div className="aiw-metric">
        <div className="aiw-metric-row">
          <span>Readability Score</span>
          <span>{readabilityLabel}</span>
        </div>
        <div className="aiw-bar-track">
          <div className="aiw-bar-fill" style={{ width: `${readability}%` }} />
        </div>
      </div>

      <div className="aiw-section-label" style={{ marginTop: 8 }}>
        Publishing
      </div>
      <button type="button" className="aiw-list-item" onClick={onPublishToWeb}>
        <Globe size={17} />
        <div>
          <div className="aiw-list-item-title">Publish to Web</div>
          <div className="aiw-list-item-sub">Create a public URL</div>
        </div>
      </button>
      <button type="button" className="aiw-list-item" onClick={onExport}>
        <FileDown size={17} />
        <div>
          <div className="aiw-list-item-title">Export Document</div>
          <div className="aiw-list-item-sub">PDF, DOCX, Markdown</div>
        </div>
      </button>

      <div className="aiw-section-label" style={{ marginTop: 8 }}>
        Recent Revisions
      </div>
      {revisions.map((rev) => (
        <div key={rev.title} className={`aiw-revision${rev.current ? " is-current" : ""}`}>
          <span className="aiw-revision-dot" />
          <div>
            <div className="aiw-revision-title">{rev.title}</div>
            <div className="aiw-revision-sub">{rev.sub}</div>
          </div>
        </div>
      ))}

      <div className="aiw-sidebar-spacer" />

      <button type="button" className="aiw-cta-btn" onClick={onPublishNow} disabled={publishing}>
        <Rocket size={15} />
        {publishing ? "Publishing..." : "Publish Now"}
      </button>
    </div>
  );
}
