import React, { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";

export const NotificationComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const content = [
    {
      icon: <HiOutlineMail size={20} />,
      title: "Email Notifications",
      description: "Manage your email preferences",
      child: [
        {
          title: "Weekly Newsletter",
          description: "A summary of top stories from the week.",
        },
        {
          title: "New Features",
          description: "Updates about platform improvements.",
        },
        {
          title: "Account Activity",
          description: "Security alerts and account updates.",
        },
      ],
    },
    {
      icon: <MdNotifications size={20} />,
      title: "Push Notifications",
      description: "Manage your mobile and web push alerts",
      child: [
        {
          title: "New Comments",
          description: "When someone comments on your articles.",
        },
        {
          title: "Mentions",
          description: "When someone mentions you in a comment.",
        },
        {
          title: "New Followers",
          description: "When someone starts following you.",
        },
      ],
    },
  ];

  const handleToggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div style={{ maxWidth: 720, paddingTop: 20 }}>
      {content.map((item, index) => (
        <div
          key={index}
          style={{
            background: "linear-gradient(180deg, #141414, #0b0b0b)",
            borderRadius: 16,
            padding: 24,
            color: "#ffffff",
            fontFamily: "Inter, sans-serif",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          {/* Header */}
          <div
            onClick={() => handleToggle(index)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #7c5cff, #a78bfa)",
              }}
            >
              {item.icon}
            </div>

            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: "#9ca3af" }}>
                {item.description}
              </div>
            </div>
          </div>

          {/* Children */}
          {activeIndex === index && (
            <div style={{ marginTop: 24 }}>
              {item.child.map((childItem, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 6 }}>
                        {childItem.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {childItem.description}
                      </div>
                    </div>

                    <label
                      style={{
                        position: "relative",
                        width: 46,
                        height: 24,
                      }}
                    >
                      <input type="checkbox" defaultChecked style={{ display: "none" }} />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "#7c5cff",
                          borderRadius: 999,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 3,
                          left: 25,
                          width: 18,
                          height: 18,
                          background: "#ffffff",
                          borderRadius: "50%",
                        }}
                      />
                    </label>
                  </div>

                  {i !== item.child.length - 1 && (
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
