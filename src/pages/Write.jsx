
import { useState } from "react";
import Editor from "../components/editer/Editer";
import { AiOutlineFileText } from "react-icons/ai";

export const Write = () => {
  const [title, setTitle] = useState("Untitled Article");

  const handleBlur = () => {
    if (!title.trim()) setTitle("Untitled Article");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      padding: "1rem",
      maxWidth: 1200,
      margin: "0 auto",
      boxSizing: "border-box"
    }}>
      
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            border: "none",
            outline: "none",
            background: "transparent",
            flex: 1,
            minWidth: "200px"
          }}
        />

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 6,
            background: "#7c5cff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            minWidth: 120,
            fontWeight: 500
          }}
        >
          <AiOutlineFileText size={20} /> Publish
        </button>
      </div>

      {/* Editor */}
      <Editor />
    </div>
  );
};
