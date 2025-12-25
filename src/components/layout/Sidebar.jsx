
import Drawer from "../Sidebar/Drawer";
import { LogoutSection } from "../Sidebar/LogoutSection";
import { theme } from "../../theme/Theme";
import { useState } from "react";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 1001,
          background: theme.colors.accent,
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: theme.radius.sm,
          display: "none"
        }}
        className="sidebar-toggle"
      >
        ☰
      </button>

      <aside
        style={{
          width: isOpen ? theme.sidebar.width : 0,
          background: theme.colors.bgPrimary,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          borderRight: `1px solid ${theme.colors.border}`,
          transition: "0.3s ease",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <div>
          <h2
            style={{
              padding: "40px 30px 20px",
              color: theme.colors.textPrimary,
            }}
          >
            Lumina
          </h2>

          <Drawer />
        </div>

        <LogoutSection />
      </aside>
    </>
  );
};
