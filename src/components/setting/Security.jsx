
import React, { useState } from "react";
import { Header } from '../shared/Header';
import { FiKey } from "react-icons/fi";
import { SaveButton } from "../shared/SettingComponent";
import { theme } from '../../theme/Theme';

export const Security = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    console.log({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      border: `2px solid ${theme.colors.border}`,
      background: theme.colors.bgSecondary,
      fontFamily: "Inter, sans-serif",
      color: theme.colors.textPrimary
    }}>
      <Header 
        title="Security"
        description="Protect your account and manage access..."
      />

      <div style={{
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        background: theme.colors.bgPrimary,
        border: `1px solid rgba(255,255,255,0.08)`
      }}>
        {/* Icon + Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: theme.spacing.md }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(124, 92, 255, 0.1)",
            color: theme.colors.accent
          }}>
            <FiKey size={24} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Password</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>
              Update your password associated with this account.
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[{
            placeholder: "Current Password",
            value: currentPassword,
            setter: setCurrentPassword
          },{
            placeholder: "New Password",
            value: newPassword,
            setter: setNewPassword
          },{
            placeholder: "Confirm New Password",
            value: confirmPassword,
            setter: setConfirmPassword
          }].map((field, idx) => (
            <input
              key={idx}
              type="password"
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              style={{
                padding: 12,
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.bgPrimary,
                color: theme.colors.textPrimary,
                outline: "none",
                fontSize: 14
              }}
            />
          ))}
        </div>

        {/* Update Button */}
        <div style={{ marginTop: theme.spacing.md, display:'flex', justifyContent:'flex-end' }}>
          <SaveButton handleSave={handleUpdate} text="Update Password" />
        </div>
      </div>
    </div>
  );
};
