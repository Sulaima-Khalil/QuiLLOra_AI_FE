import { Wand2, Search, CheckCircle2, ListTree, Image as ImageIcon, FileText, Palette, Zap } from "lucide-react";

const NAV_TOOLS = [
  { key: "rewrite", label: "Rewrite Selection", icon: Wand2, badge: "3R" },
  { key: "research", label: "Deep Research", icon: Search },
  { key: "factcheck", label: "Fact-check", icon: CheckCircle2 },
  { key: "outline", label: "Content Outline", icon: ListTree },
  { key: "images", label: "Contextual Images", icon: ImageIcon },
];

const QUICK_ACTIONS = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "tone", label: "Tone", icon: Palette },
];

export default function NeuralSidebar({ activeKey, onSelect, insightText, onGenerateNext, generating }) {
  return (
    <div className="aiw-sidebar">
      <div className="aiw-section-label">Neural Core</div>
      <div className="aiw-nav">
        {NAV_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = activeKey === tool.key;
          return (
            <button
              key={tool.key}
              type="button"
              className={`aiw-nav-item${active ? " is-active" : ""}`}
              onClick={() => onSelect(tool.key)}
            >
              <Icon size={16} />
              <span className="grow">{tool.label}</span>
              {tool.badge && <span className="aiw-nav-badge">{tool.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="aiw-section-label">Quick Actions</div>
      <div className="aiw-quick-grid">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const active = activeKey === action.key;
          return (
            <button
              key={action.key}
              type="button"
              className={`aiw-quick-btn${active ? " is-active" : ""}`}
              onClick={() => onSelect(action.key)}
            >
              <Icon size={18} />
              {action.label}
            </button>
          );
        })}
      </div>

      {insightText && (
        <div className="aiw-insight-card">
          <div className="aiw-insight-head">
            <span className="aiw-insight-dot" />
            Neural Insight
          </div>
          <p className="aiw-insight-text">{insightText}</p>
        </div>
      )}

      <div className="aiw-sidebar-spacer" />

      <button type="button" className="aiw-cta-btn" onClick={onGenerateNext} disabled={generating}>
        <Zap size={15} />
        {generating ? "Generating..." : "Generate Next Section"}
      </button>
    </div>
  );
}
