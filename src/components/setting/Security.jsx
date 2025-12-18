import React, { useState } from "react";
import { Section, InputItem, SaveButton } from "../shared/SettingComponent";

export const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = () => {
    console.log({ currentPassword, newPassword });
  };

  return (
    <div>
      <Section title="Security Settings">
        <InputItem
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <InputItem
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <SaveButton onClick={handleSave} />
      </Section>
    </div>
  );
};
