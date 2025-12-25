
import { useState } from "react";
import { ArticleHeader } from "../components/Article/Header";
import { ArticleCards } from "../components/Article/ArticleCard";
import { ArticleTabs } from "../components/Article/ArticleTabs";
import { theme } from "../theme/Theme";

const MyArticle = () => {
  const [activetab, setActiveTab] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        maxWidth: 1400,
        margin: "0 auto",
        // background: theme.colors.bgPrimary,
        color: theme.colors.textPrimary,
      }}
    >
      <ArticleHeader />
      <ArticleTabs activetab={activetab} setActiveTab={setActiveTab} />
      <ArticleCards activetab={activetab} />
    </div>
  );
};

export default MyArticle;
