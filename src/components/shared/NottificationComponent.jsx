

import  { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { MdNotifications } from "react-icons/md";
import { theme } from '../../theme/Theme';

export const NotificationComponent = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const content = [
    {
      icon: <HiOutlineMail size={20} />,
      title: "Email Notifications",
      description: "Manage your email preferences",
      child: [
        { title: "Weekly Newsletter", description: "Summary of top stories from the week." },
        { title: "New Features", description: "Updates about platform improvements." },
        { title: "Account Activity", description: "Security alerts and account updates." },
      ]
    },
    {
      icon: <MdNotifications size={20} />,
      title: "Push Notifications",
      description: "Manage your mobile and web push alerts",
      child: [
        { title: "New Comments", description: "When someone comments on your articles." },
        { title: "Mentions", description: "When someone mentions you in a comment." },
        { title: "New Followers", description: "When someone starts following you." },
      ]
    }
  ];

  const handleToggle = (index) => setActiveIndex(index === activeIndex ? null : index);

  return (
    <div style={{ marginTop: theme.spacing.md }}>
      {content.map((item, index) => (
        <div
          key={index}
          style={{
            background: theme.colors.cardBg,
            borderRadius: theme.radius.md,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            border: `1px solid ${theme.colors.border}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div onClick={() => handleToggle(index)} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.colors.accent}, #a78bfa)`
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: theme.fontSize.lg }}>{item.title}</div>
              <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>{item.description}</div>
            </div>
          </div>

          {activeIndex === index && (
            <div style={{ marginTop: theme.spacing.md }}>
              {item.child.map((childItem, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${theme.spacing.sm}px 0` }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{childItem.title}</div>
                      <div style={{ fontSize: theme.fontSize.sm, color: theme.colors.textSecondary }}>{childItem.description}</div>
                    </div>

                    <label style={{ position: "relative", width: 46, height: 24 }}>
                      <input type="checkbox" defaultChecked style={{ display: "none" }} />
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 999,
                        background: theme.colors.accent,
                        transition: 'all 0.2s ease'
                      }} />
                      <span style={{
                        position: "absolute",
                        top: 3,
                        left: 25,
                        width: 18,
                        height: 18,
                        background: "#fff",
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                      }} />
                    </label>
                  </div>
                  {i !== item.child.length - 1 && <div style={{ height: 1, background: theme.colors.border }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
