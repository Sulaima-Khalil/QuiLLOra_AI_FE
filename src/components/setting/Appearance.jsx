import React, { useState } from "react";
import { Section, ToggleItem, SaveButton } from "../shared/SettingComponent";

export const Appearance = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = () => {
    console.log({ darkMode, fontSize });
  };

  return (
    <div>
      <Section title="Appearance Settings">
        <ToggleItem
          label="Dark Mode"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />

        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <label style={{ marginRight: '8px' }}>Font Size:</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px' }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <SaveButton onClick={handleSave} />
      </Section>
    </div>
  );
};
