
import { MdLogout } from "react-icons/md";
import { logoutUser } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { theme } from "../../theme/Theme.js";

export const LogoutSection = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div
      onClick={handleLogout}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 30,
        cursor: "pointer",
        color: theme.colors.textPrimary,
        borderTop: `1px solid ${theme.colors.border}`,
      }}
    >
      <MdLogout size={22} />
      <span>Sign out</span>
    </div>
  );
};
