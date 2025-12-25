
import  { useState } from "react";
import { Header } from '../shared/Header';
import { CiLight, CiDark } from "react-icons/ci";
import { RiComputerLine } from "react-icons/ri";
import { SaveButton } from '../shared/SettingComponent';
import { theme } from '../../theme/Theme';

export const Appearance = () => {
  const [themeMode, setThemeMode] = useState("System");
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = () => {
    console.log({ themeMode, fontSize });
  };

  const modes = [
    { name: 'Light', icon: <CiLight /> },
    { name: 'Dark', icon: <CiDark /> },
    { name: 'System', icon: <RiComputerLine /> }
  ];

  return (
    <div style={{
      maxWidth: 480,
      margin: "0 auto",
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      border: `2px solid ${theme.colors.border}`,
      background: theme.colors.bgSecondary,
      fontFamily: "Inter, sans-serif",
      color: theme.colors.textPrimary
    }}>
      <Header
        title="Appearance"
        description="Customize how Lumina looks on your device..."
      />

      {/* Theme Selection */}
      <div style={{ marginTop: theme.spacing.md }}>
        <h4 style={{ marginBottom: theme.spacing.sm }}>Theme</h4>
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          {modes.map((mode, idx) => (
            <div 
              key={idx}
              onClick={() => setThemeMode(mode.name)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: theme.spacing.sm,
                borderRadius: theme.radius.sm,
                border: themeMode === mode.name ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: themeMode === mode.name ? theme.colors.hover : theme.colors.bgSecondary
              }}
            >
              <span style={{ fontSize: 28, marginBottom: 6 }}>{mode.icon}</span>
              <p style={{ margin: 0, fontWeight: 600 }}>{mode.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div style={{ marginTop: theme.spacing.lg }}>
        <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Font Size</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.bgPrimary,
            color: theme.colors.textPrimary
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: theme.spacing.lg, display: 'flex', justifyContent: 'flex-end' }}>
        <SaveButton handleSave={handleSave} />
      </div>
    </div>
  );
};
