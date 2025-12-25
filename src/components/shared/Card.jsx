
import { GoClock } from "react-icons/go";
import { theme } from "../../theme/Theme";

export const Card = ({ cardsData, isArticle }) => {
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : words[0][0].toUpperCase() + words[1][0].toUpperCase();
  };

  return (
    <>
      {cardsData.map((item, index) => (
        <div
          key={index}
          style={{
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.radius.lg,
            background: theme.colors.bgSecondary,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Image */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: theme.colors.bgPrimary,
                padding: "6px 12px",
                borderRadius: theme.radius.md,
                fontSize: 12,
              }}
            >
              {item.title}
            </span>

            {isArticle && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  border: `2px solid ${theme.colors.warning}`,
                  color: theme.colors.warning,
                  padding: "6px 12px",
                  borderRadius: theme.radius.md,
                  fontSize: 12,
                }}
              >
                {item.status}
              </span>
            )}

            <img
              src={item.img}
              alt={item.heading}
              style={{ width: "100%", height: 220, objectFit: "cover" }}
            />
          </div>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              padding: theme.spacing.sm,
              color: theme.colors.textSecondary,
            }}
          >
            <span>{item.date}</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <GoClock /> {item.readingTime}
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: theme.spacing.sm }}>
            <h3 style={{ marginBottom: 8 }}>{item.heading}</h3>
            <p style={{ color: theme.colors.textSecondary }}>
              {item.description}
            </p>
          </div>

          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: theme.spacing.sm,
              gap: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: theme.colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
              }}
            >
              {getInitials(item.author)}
            </div>
            <span>{item.author}</span>
          </div>
        </div>
      ))}
    </>
  );
};
