import { useState } from "react";
import Editor from "../components/editer/Editer";
import { AiOutlineFileText } from "react-icons/ai";

export const Write = () => {
  const [title, setTitle] = useState("Untitled Article");

  const handleBlur = () => {
    if (!title.trim()) {
      setTitle("Untitled Article");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, margin: 30 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Editable Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          style={{
            fontSize: 22,
            fontWeight: 600,
            border: "none",
            outline: "none",
            background: "transparent",
            width: "70%",
          }}
        />

        <div style={{ display: "flex", gap: 40 }}>
          <button
            style={{
              width: 110,
              height: 40,
              padding: 8,
              borderRadius: 6,
              background: "#7c5cff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            <AiOutlineFileText style={{ background: "#7c5cff",}}/> Publish
          </button>
        </div>
      </div>

      <Editor />
    </div>
  );
};
