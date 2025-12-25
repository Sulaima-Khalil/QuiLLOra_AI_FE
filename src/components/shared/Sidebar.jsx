
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ content, ActiveIndex, activeIndicator }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleItemClick = (index, path) => {
    setActiveIndex(index);
    navigate(path);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "12px 0",
        width: "100%",
        maxWidth: 280,
      }}
    >
      {content.map((item, index) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={index}
            onClick={() => handleItemClick(index, item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 16px",
              margin: "4px 8px",
              borderRadius: 10,
              cursor: "pointer",
              position: "relative",
              transition: "all 0.25s ease",
              background: isActive ? "#0e0e0e" : "transparent",
              border: isActive
                ? "1px solid #7c5cff"
                : "1px solid transparent",
              color: isActive ? "#ffffff" : "#a1a1a1",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "#151515";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Left Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 15,
                fontWeight: isActive ? 500 : 400,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  color: isActive ? "#7c5cff" : "#9ca3af",
                }}
              >
                {item.icon}
              </span>
              <span>{item.title}</span>
            </div>

            {/* Right Indicator Dot */}
            {activeIndicator && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isActive ? "#7c5cff" : "transparent",
                  boxShadow: isActive ? "0 0 8px #7c5cff" : "none",
                  transition: "all 0.3s ease",
                }}
              />
            )}

            {/* Left Active Bar */}
            {ActiveIndex && isActive && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 4,
                  height: "60%",
                  background: "#7c5cff",
                  borderRadius: "0 4px 4px 0",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
