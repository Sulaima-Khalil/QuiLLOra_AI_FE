import React, { useState } from "react";
import { Section, ToggleItem, SaveButton } from "../shared/SettingComponent";

export const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const handleSave = () => {
    console.log({ emailAlerts, pushAlerts });
  };

  return (
    <div>
      <Section title="Notification Settings">
        <ToggleItem
          label="Email Alerts"
          checked={emailAlerts}
          onChange={() => setEmailAlerts(!emailAlerts)}
        />
        <ToggleItem
          label="Push Notifications"
          checked={pushAlerts}
          onChange={() => setPushAlerts(!pushAlerts)}
        />
        <SaveButton onClick={handleSave} />
      </Section>
    </div>
  );
};
