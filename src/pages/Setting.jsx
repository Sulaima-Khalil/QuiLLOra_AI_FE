
import { Header } from '../components/shared/Header';
import { Sidebar } from '../components/shared/Sidebar';
import { Outlet } from 'react-router-dom';
import { MdOutlinePerson, MdNotifications } from "react-icons/md";
import { IoColorPalette } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { theme } from '../theme/Theme';

export const Setting = () => {
  const pages = [
    { title: "Account", path: 'account', icon: <MdOutlinePerson /> },
    { title: "Notifications", path: 'notification', icon: <MdNotifications /> },
    { title: "Appearance", path: 'appearance', icon: <IoColorPalette /> },
    { title: "Security", path: 'security', icon: <IoLockClosedOutline /> },
  ];

  return (
    <div style={{ minHeight: '100vh', 
    // background: theme.colors.bgPrimary,
     color: theme.colors.textPrimary }}>
      <Header
        title="Settings"
        description="Manage your account preferences and appearance..."
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', paddingTop: theme.spacing.lg }}>
        <Sidebar content={pages} activeIndicator={true} />

        <div style={{
          flex: 1,
          padding: theme.spacing.md,
          minWidth: 300,
          maxWidth: 800
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
