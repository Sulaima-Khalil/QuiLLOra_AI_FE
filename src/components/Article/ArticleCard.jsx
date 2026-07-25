import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { ArticleCard as Card, ArticleCardGrid } from "../shared/ArticleCard";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { getArticles, deleteArticle, archiveArticle, restoreArticle } from "../../utils/articlesStore";

export const ArticleCards = ({ activetab, query = "" }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(getArticles);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filtered = articles
    .filter((a) => a.status !== "Archived")
    .filter((item) => {
      if (activetab === 1) return item.status === "Published";
      if (activetab === 2) return item.status === "Draft";
      return true;
    })
    .filter((item) => `${item.title} ${item.author}`.toLowerCase().includes(query.toLowerCase()));

  const handleArchive = (id) => {
    archiveArticle(id);
    setArticles(getArticles());
  };

  const handleRestore = (id) => {
    restoreArticle(id);
    setArticles(getArticles());
  };

  const confirmDelete = () => {
    deleteArticle(pendingDelete);
    setArticles(getArticles());
    setPendingDelete(null);
  };

  if (filtered.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
        {query ? `No articles match "${query}".` : "No articles here yet."}
      </Typography>
    );
  }

  return (
    <>
      <ArticleCardGrid>
        {filtered.map((item) => (
          <Card
            key={item.id}
            {...item}
            onEdit={() => navigate(`/dashboard/write?edit=${item.id}`)}
            onArchive={() => (item.status === "Archived" ? handleRestore(item.id) : handleArchive(item.id))}
            onDelete={() => setPendingDelete(item.id)}
          />
        ))}
      </ArticleCardGrid>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete article?"
        description="This will permanently remove the article. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
};
