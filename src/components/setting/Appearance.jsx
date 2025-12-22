import React, { useState } from "react";
import { Header } from '../shared/Header';
import { CiLight, CiDark } from "react-icons/ci";
import { RiComputerLine } from "react-icons/ri";
import { SaveButton } from '../shared/SettingComponent'
export const Appearance = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = () => {
    console.log({ darkMode, fontSize });
  };

  const modes = [
    { name: 'Light', icon: <CiLight /> },
    { name: 'Dark', icon: <CiDark /> },
    { name: 'System', icon: <RiComputerLine /> }
  ];

  return (
    <div style={{
      maxWidth: 400,
      height: 'auto',
      border: '2px solid #1F1F1F',
      padding: 20,
      borderRadius: 12,
      fontFamily: "Inter, sans-serif"
    }}>
      <Header
        title="Appearance"
        description="Customize how lumina looks on your device..."
      />

      <div style={{ paddingTop: 20 }}>
        <h4 style={{ marginBottom: 16 }}>Theme</h4>

        {modes.map((mode, index) => (
          <div key={index} style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 10,
              borderRadius: 8,
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: 24 }}>{mode.icon}</span>
              <p style={{ margin: 0, fontWeight: 500 }}>{mode.name}</p>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              style={{
                width: '100%',
                accentColor: '#7c5cff',
                height: 6,
                borderRadius: 4,
                marginTop: 8
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, marginBottom: 30 }}>
        <label style={{ marginRight: 8 }}>Font Size:</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={{ padding: 6, borderRadius: 4 }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

     <SaveButton handleSave={handleSave}/>
    </div>
  );
};
