import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Plus,
  Download,
  Pencil,
  BarChart2,
  Archive as ArchiveIcon,
  ArchiveRestore,
  Trash2,
  List,
  LayoutGrid,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import {
  getArticles,
  archiveArticle,
  restoreArticle,
  deleteArticle,
  refreshArticles,
  subscribeArticles,
} from "../utils/articlesStore";
import { ArticleCard, ArticleCardGrid } from "../components/shared/ArticleCard";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { FilterInput } from "../components/shared/FilterInput";

const statusStyles = {
  Published: { bgcolor: "#DFF7EE", color: brandColors.primary },
  Draft: { bgcolor: "#EEF1F0", color: brandColors.text },
  Archived: { bgcolor: "#FBEAE7", color: "#C25B4A" },
};

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const filterTabs = ["All Files", "Active", "Archived"];

export default function Archive() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(getArticles);
  const [activeTab, setActiveTab] = useState("All Files");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  // The store hydrates from the API after mount, so the page subscribes
  // rather than reading the cache once.
  useEffect(() => {
    const unsubscribe = subscribeArticles(setArticles);
    refreshArticles();
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return articles
      .filter((a) => {
        if (activeTab === "Active") return a.status !== "Archived";
        if (activeTab === "Archived") return a.status === "Archived";
        return true;
      })
      .filter((a) => `${a.title} ${a.author}`.toLowerCase().includes(query.toLowerCase()));
  }, [articles, activeTab, query]);

  const handleEdit = (id) => navigate(`/dashboard/write?edit=${id}`);
  const handleStats = () => navigate("/dashboard/analytics");
  // The store refreshes its cache and notifies subscribers on success.
  const handleArchive = (id) => archiveArticle(id);
  const handleRestore = (id) => restoreArticle(id);
  const confirmDelete = async () => {
    await deleteArticle(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { md: "flex-end" }
        }}>
        <Box>
          <Stack direction="row" spacing={0.75} sx={{
            alignItems: "center"
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: brandColors.secondary }}>
              ARCHIVE ENGINE ONLINE
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ mt: 0.5, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}>
            Content Repository
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Manage your editorial history and AI-assisted drafts.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            component="a"
            href="/dashboard/write"
            onClick={(e) => { e.preventDefault(); navigate("/dashboard/write"); }}
            variant="contained"
            size="small"
            startIcon={<Plus size={15} />}
            sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            New Article
          </Button>
          <Button variant="outlined" size="small" startIcon={<Download size={14} />} sx={{ color: "text.primary", borderColor: "divider", bgcolor: "background.paper" }}>
            Export All
          </Button>
        </Stack>
      </Stack>
      {/* Filter + tabs */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 3 }}>
        <FilterInput
          value={query}
          onChange={setQuery}
          placeholder="Filter by title or author..."
          sx={{ flex: 1 }}
        />

        <Stack direction="row" spacing={1}>
          {filterTabs.map((tab) => (
            <Button
              key={tab}
              size="small"
              onClick={() => setActiveTab(tab)}
              sx={{
                px: 2,
                borderRadius: 2,
                fontWeight: 600,
                ...(activeTab === tab
                  ? { bgcolor: brandColors.dark, color: "#fff", "&:hover": { bgcolor: brandColors.primaryDark } }
                  : { bgcolor: "#E9EDEB", color: "text.secondary", "&:hover": { bgcolor: brandColors.hover } }),
              }}
            >
              {tab}
            </Button>
          ))}
        </Stack>
      </Stack>
      {/* View toggle */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          mt: 2.5
        }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => setView("list")}
            sx={{ borderRadius: 1.5, bgcolor: view === "list" ? brandColors.hover : "transparent", color: view === "list" ? "primary.main" : "text.secondary" }}
          >
            <List size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setView("grid")}
            sx={{ borderRadius: 1.5, bgcolor: view === "grid" ? brandColors.hover : "transparent", color: view === "grid" ? "primary.main" : "text.secondary" }}
          >
            <LayoutGrid size={16} />
          </IconButton>
        </Stack>
      </Stack>
      {filtered.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
          No articles match your filters.
        </Typography>
      ) : view === "grid" ? (
        <Box sx={{ mt: 2 }}>
          <ArticleCardGrid>
            {filtered.map((a) => (
              <ArticleCard
                key={a.id}
                {...a}
                onEdit={() => handleEdit(a.id)}
                onArchive={() => (a.status === "Archived" ? handleRestore(a.id) : handleArchive(a.id))}
                onDelete={() => setPendingDelete(a.id)}
              />
            ))}
          </ArticleCardGrid>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {filtered.map((a) => {
            const archived = a.status === "Archived";
            return (
              <Stack
                key={a.id}
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { sm: "center" },
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: archived ? "#EDF0EF" : "background.paper",
                  boxShadow: archived ? "none" : 1,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: archived ? "none" : 3 }
                }}>
                <Box
                  component="img"
                  src={a.img}
                  alt={a.title}
                  sx={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    borderRadius: "50%",
                    objectFit: "cover",
                    alignSelf: { xs: "flex-start", sm: "center" },
                    filter: archived ? "grayscale(1)" : "none",
                    opacity: archived ? 0.7 : 1,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1.5} sx={{
                    alignItems: "center"
                  }}>
                    <Chip
                      label={a.status.toUpperCase()}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, ...statusStyles[a.status] }}
                    />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {a.date}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      color: archived ? "text.secondary" : "text.primary",
                      textDecoration: archived ? "line-through" : "none",
                    }}
                  >
                    {a.title}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      mt: 0.5
                    }}>
                    <Avatar sx={{ width: 18, height: 18, fontSize: 8, fontWeight: 700, bgcolor: archived ? "#9AA6A2" : brandColors.primary }}>
                      {getInitials(a.author)}
                    </Avatar>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {a.author}
                    </Typography>
                    <Typography variant="caption" sx={{ color: archived ? "text.secondary" : "primary.main", fontWeight: 600 }}>
                      · {a.category}
                    </Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleEdit(a.id)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton size="small" onClick={handleStats} sx={{ color: brandColors.primary }}>
                    <BarChart2 size={16} />
                  </IconButton>
                  {archived ? (
                    <IconButton size="small" onClick={() => handleRestore(a.id)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                      <ArchiveRestore size={16} />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={() => handleArchive(a.id)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                      <ArchiveIcon size={16} />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => setPendingDelete(a.id)} sx={{ color: "#C25B4A" }}>
                    <Trash2 size={16} />
                  </IconButton>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete article?"
        description="This will permanently remove the article. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Box>
  );
}
