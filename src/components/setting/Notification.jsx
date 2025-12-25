

import  { useState } from "react";
import { SaveButton } from "../shared/SettingComponent";
import { Header } from '../shared/Header';
import { NotificationComponent } from '../shared/NottificationComponent';
import { theme } from '../../theme/Theme';

export const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const handleSave = () => {
    console.log({ emailAlerts, pushAlerts });
  };

  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: theme.spacing.lg,
      // background: theme.colors.bgPrimary,
      color: theme.colors.textPrimary,
      borderRadius: theme.radius.md,
      border: `2px solid ${theme.colors.border}`,
      fontFamily: "Inter, sans-serif"
    }}>
      <Header 
        title="Notifications"
        description="Choose what you want to be notified about..."
      />
      <NotificationComponent />
      <div style={{ marginTop: theme.spacing.lg, display: 'flex', justifyContent: 'flex-end' }}>
        <SaveButton onClick={handleSave} />
      </div>
    </div>
  );
};
