
import { Sidebar } from "./layout/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { theme } from "../theme/Theme.js";

export const Home = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: theme.sidebar.width,
          padding: 24,
          flex: 1,
          background: theme.colors.bgSecondary,
          minHeight: "100vh",
          transition: "0.3s ease",
        }}
        className="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
};
