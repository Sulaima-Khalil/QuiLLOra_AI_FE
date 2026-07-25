import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Archive as ArchiveIcon,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import {
  getArticles,
  deleteArticle,
  archiveArticle,
  refreshArticles,
  subscribeArticles,
} from "../utils/articlesStore";
import { articleMetrics, formatViews, formatWords, formatCount } from "../utils/metrics";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";

const TABS = ["All", "Published", "Drafts", "Scheduled"];
const PAGE_SIZE = 10;

const statusDot = {
  Published: brandColors.secondary,
  Draft: brandColors.accentGold,
  Scheduled: "#5B8DEF",
  Archived: brandColors.text,
};

const StatCard = ({ label, value, delta, deltaTone = "up", highlight, to }) => {
  if (highlight) {
    return (
      <Box
        component={to ? Link : "div"}
        to={to}
        sx={{
          p: 2.25,
          borderRadius: 3,
          textDecoration: "none",
          background: `linear-gradient(135deg, ${brandColors.secondary} 0%, ${brandColors.primary} 100%)`,
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 104,
          boxShadow: "0 8px 24px rgba(14,111,92,0.25)",
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, opacity: 0.9 }}>
            {label}
          </Typography>
          <ArrowRight size={16} />
        </Stack>
        <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        p: 2.25,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        minHeight: 104,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "text.secondary" }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
        <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1, color: "text.primary" }}>
          {value}
        </Typography>
        {delta && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: deltaTone === "up" ? brandColors.primary : "text.secondary",
            }}
          >
            {delta}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

const SeoBar = ({ value }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
    <Box sx={{ width: 46, height: 4, borderRadius: 99, bgcolor: brandColors.hover, overflow: "hidden" }}>
      <Box sx={{ width: `${value}%`, height: "100%", borderRadius: 99, bgcolor: brandColors.primary }} />
    </Box>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{value}</Typography>
  </Stack>
);

const COLS = "minmax(220px, 2.4fr) 1fr 0.9fr 0.8fr 0.9fr 0.9fr 64px";

const MyArticle = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState(getArticles);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState({ anchor: null, item: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  // The store hydrates from the API after mount, so the page subscribes
  // rather than reading the cache once.
  useEffect(() => {
    const unsubscribe = subscribeArticles(setArticles);
    refreshArticles();
    return unsubscribe;
  }, []);

  const withMetrics = useMemo(
    () => articles.map((a) => ({ ...a, metrics: articleMetrics(a) })),
    [articles]
  );

  const stats = useMemo(() => {
    const published = withMetrics.filter((a) => a.status === "Published");
    const drafts = withMetrics.filter((a) => a.status === "Draft");
    const totalViews = published.reduce((sum, a) => sum + a.metrics.views, 0);
    const avgSeo = withMetrics.length
      ? Math.round(withMetrics.reduce((s, a) => s + a.metrics.seo, 0) / withMetrics.length)
      : 0;
    return {
      published: published.length,
      totalViews,
      avgSeo,
      drafts: drafts.length,
    };
  }, [withMetrics]);

  const filtered = useMemo(() => {
    const active = TABS[tab];
    return withMetrics.filter((a) => {
      if (active === "Published") return a.status === "Published";
      if (active === "Drafts") return a.status === "Draft";
      if (active === "Scheduled") return a.status === "Scheduled";
      return a.status !== "Archived";
    });
  }, [withMetrics, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const closeMenu = () => setMenu({ anchor: null, item: null });

  const handleArchive = () => {
    // The store refreshes its cache and notifies subscribers on success.
    archiveArticle(menu.item.id);
    closeMenu();
  };

  const confirmDelete = async () => {
    await deleteArticle(pendingDelete);
    setPendingDelete(null);
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.85rem" }, color: "text.primary" }}
          >
            My Articles
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Manage, edit, and track the performance of your editorial workspace.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button
            startIcon={<SlidersHorizontal size={15} />}
            sx={{ color: "text.primary", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: brandColors.hover } }}
          >
            Filters
          </Button>
          <Button
            component={Link}
            to="/dashboard/write"
            variant="contained"
            startIcon={<Plus size={16} />}
            sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            New Article
          </Button>
        </Stack>
      </Stack>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        <StatCard label="Total Published" value={stats.published} delta="+12%" />
        <StatCard label="Total Views" value={formatCount(stats.totalViews)} delta="+8.4%" />
        <StatCard label="Avg. SEO Score" value={stats.avgSeo} delta="High" deltaTone="flat" />
        <StatCard label="Drafts Ready" value={String(stats.drafts).padStart(2, "0")} highlight to="/dashboard/write" />
      </Box>

      {/* Tabs + sort */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {TABS.map((t, i) => (
            <Button
              key={t}
              size="small"
              onClick={() => { setTab(i); setPage(0); }}
              sx={{
                px: 2,
                borderRadius: 2,
                fontWeight: 700,
                ...(tab === i
                  ? { bgcolor: brandColors.dark, color: "#fff", "&:hover": { bgcolor: brandColors.primaryDark } }
                  : { color: "text.secondary", "&:hover": { bgcolor: brandColors.hover } }),
              }}
            >
              {t}
            </Button>
          ))}
        </Stack>
        <Button
          size="small"
          endIcon={<ChevronDown size={14} />}
          sx={{ color: "text.secondary", fontWeight: 600, alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Sort by: Last Edited
        </Button>
      </Stack>

      {/* Table */}
      <Box sx={{ borderRadius: 0, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 760 }}>
            {/* Head */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: 2,
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: brandColors.bgSecondary,
              }}
            >
              {["Article Title", "Category", "Status", "Views", "SEO", "Edited", "Actions"].map((h, i, arr) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    textAlign: i === arr.length - 1 ? "right" : "left",
                  }}
                >
                  {h}
                </Typography>
              ))}
            </Box>
            {/* Rows */}
            {rows.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 6 }}>
                No articles in this view yet.
              </Typography>
            ) : (
              rows.map((a) => (
                <Box
                  key={a.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: COLS,
                    gap: 2,
                    px: 2.5,
                    py: 1.75,
                    alignItems: "center",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "background 0.15s",
                    "&:last-of-type": { borderBottom: "none" },
                    "&:hover": { bgcolor: brandColors.bgSecondary },
                  }}
                >
                  {/* Title */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                    <Box
                      component="img"
                      src={a.img}
                      alt=""
                      sx={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        component={Link}
                        to={`/dashboard/write?edit=${a.id}`}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: 13.5,
                          fontWeight: 700,
                          lineHeight: 1.25,
                          color: brandColors.primary,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {a.title}
                      </Typography>
                      <Typography sx={{ mt: 0.25, fontSize: 11.5, color: "text.secondary" }}>
                        {formatWords(a.metrics.words)} · {a.metrics.readerType}
                      </Typography>
                    </Box>
                  </Stack>
                  {/* Category */}
                  <Box>
                    <Chip
                      label={a.category}
                      size="small"
                      sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: brandColors.hover, color: brandColors.primaryDark }}
                    />
                  </Box>
                  {/* Status */}
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusDot[a.status] || brandColors.text }} />
                    <Typography sx={{ fontSize: 12.5, color: "text.primary" }}>{a.status}</Typography>
                  </Stack>
                  {/* Views */}
                  <Typography sx={{ fontSize: 13, color: "text.primary" }}>
                    {a.metrics.views ? formatViews(a.metrics.views) : "—"}
                  </Typography>
                  {/* SEO */}
                  <SeoBar value={a.metrics.seo} />
                  {/* Edited */}
                  <Typography sx={{ fontSize: 12.5, color: a.date === "Just now" ? brandColors.primary : "text.secondary" }}>
                    {a.date}
                  </Typography>
                  {/* Menu */}
                  <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, item: a })} sx={{ color: "text.secondary", justifySelf: "end" }}>
                    <MoreVertical size={16} />
                  </IconButton>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Footer / pagination */}
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Showing {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}-{Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of {filtered.length} articles
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <IconButton size="small" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} sx={{ border: "1px solid", borderColor: "divider" }}>
            <ChevronLeft size={16} />
          </IconButton>
          {Array.from({ length: pageCount }).slice(0, 4).map((_, i) => (
            <Button
              key={i}
              size="small"
              onClick={() => setPage(i)}
              sx={{
                minWidth: 32,
                height: 32,
                px: 0,
                borderRadius: 1.5,
                fontWeight: 700,
                ...(safePage === i
                  ? { bgcolor: brandColors.dark, color: "#fff", "&:hover": { bgcolor: brandColors.primaryDark } }
                  : { color: "text.secondary", border: "1px solid", borderColor: "divider" }),
              }}
            >
              {i + 1}
            </Button>
          ))}
          <IconButton size="small" disabled={safePage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} sx={{ border: "1px solid", borderColor: "divider" }}>
            <ChevronRight size={16} />
          </IconButton>
        </Stack>
      </Stack>

      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={closeMenu}>
        <MenuItem onClick={() => { navigate(`/dashboard/write?edit=${menu.item.id}`); closeMenu(); }} sx={{ fontSize: 13 }}>
          <ListItemIcon><Pencil size={15} /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleArchive} sx={{ fontSize: 13 }}>
          <ListItemIcon><ArchiveIcon size={15} /></ListItemIcon>
          Archive
        </MenuItem>
        <MenuItem onClick={() => { setPendingDelete(menu.item.id); closeMenu(); }} sx={{ fontSize: 13, color: "error.main" }}>
          <ListItemIcon><Trash2 size={15} color="currentColor" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete article?"
        description="This will permanently remove the article. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Stack>
  );
};

export default MyArticle;
