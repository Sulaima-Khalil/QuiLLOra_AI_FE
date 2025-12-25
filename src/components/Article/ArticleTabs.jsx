
import { theme } from "../../theme/Theme.js";

export const ArticleTabs = ({ activetab, setActiveTab }) => {
  const tabs = ["All Articles", "Published", "Drafts"];

  return (
    <div
      style={{
        display: "flex",
        gap: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.border}`,
        overflowX: "auto",
        paddingBottom: theme.spacing.xs,
      }}
    >
      {tabs.map((item, index) => (
        <button
          key={index}
          onClick={() => setActiveTab(index)}
          style={{
            background: "transparent",
            border: "none",
            color:
              activetab === index
                ? theme.colors.accent
                : theme.colors.textSecondary,
            fontWeight: activetab === index ? 600 : 400,
            borderBottom:
              activetab === index
                ? `2px solid ${theme.colors.accent}`
                : "2px solid transparent",
            paddingBottom: theme.spacing.xs,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
};
