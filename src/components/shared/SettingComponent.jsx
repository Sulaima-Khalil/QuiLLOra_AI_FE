import React from "react";

// Section wrapper
export const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h3 style={{ marginBottom: '12px' }}>{title}</h3>
    {children}
  </div>
);

// Toggle switch
export const ToggleItem = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
    <label style={{ marginRight: '12px' }}>{label}</label>
    <input type="checkbox" checked={checked} onChange={onChange} />
  </div>
);

// Input field
export const InputItem = ({ label, value, onChange, type = "text" }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', marginBottom: '4px' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{
        padding: '8px',
        width: '100%',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    />
  </div>
);

// Save button
export const SaveButton = ({ onClick, label = "Save Changes" }) => (
  <button
    onClick={onClick}
    style={{
      padding: '10px 16px',
      backgroundColor: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {label}
  </button>
);
