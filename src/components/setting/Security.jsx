import React, { useState } from "react";
import { SaveButton } from "../shared/SettingComponent";
import { Header } from '../shared/Header';
import { FiKey } from "react-icons/fi";
export const Security = () => {
   const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    console.log({ currentPassword, newPassword, confirmPassword });
  };


  return (
    <div style={{ maxWidth:400 , height:'auto', border:'2px solid gray', padding:20 ,borderRadius:12 }}>
      <Header 
      title="Security"
      description="Protect your account and manage access..."
      />
 <div style={{
     marginTop:30,
      maxWidth: 400,
      padding: 24,
      borderRadius: 12,
      background: "#0b0b0b",
      fontFamily: "Inter, sans-serif",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.08)"
        }}>
          <FiKey size={20} />
        </div>
        <div style={{display:'flex',  flexDirection:'column',gap:8}}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Password</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Update your password associated with this account.
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#fff",
            outline: "none"
          }}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#fff",
            outline: "none"
          }}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "#fff",
            outline: "none"
          }}
        />
      </div>

      {/* Button */}
      <button
        onClick={handleUpdate}
        style={{
          marginTop: 30,
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: "#7c5cff",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(124, 92, 255, 0.3)",
          transition: "all 0.2s ease"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#a78bfa"}
        onMouseOut={(e) => e.currentTarget.style.background = "#7c5cff"}
      >
        Update Password
      </button>
    </div>
    
    </div>
  );
};
