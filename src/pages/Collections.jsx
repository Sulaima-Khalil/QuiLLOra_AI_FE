import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  AvatarGroup,
  Chip,
} from "@mui/material";
import {
  Plus,
  FolderPlus,
  Trash2,
  BookmarkX,
  Compass,
  Lock,
  Share2,
  CalendarDays,
  MoreVertical,
  Library,
  Layers,
  Users,
  HardDrive,
  BookOpen,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { ArticleCard, ArticleCardGrid } from "../components/shared/ArticleCard";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import {
  getDiscoverArticles,
  refreshDiscover,
  subscribeDiscover,
} from "../utils/discoverStore";
import {
  getState,
  subscribeCollections,
  refreshCollections,
  toggleBookmark,
  createCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
  getSavedArticles,
  getCollectionArticles,
} from "../utils/collectionsStore";

const ALL_SAVED = "all-saved";

const DESCRIPTIONS = {
  "Design Inspiration": "Curated visual references, layout studies, and design systems worth revisiting.",
};
const FALLBACK_DESC = "A curated bucket of saved articles for focused editorial research.";

const hash = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const UPDATED = ["2h ago", "1 day ago", "4h ago", "3 days ago", "5h ago"];
const collectionMeta = (id) => {
  const h = hash(id);
  return {
    updated: UPDATED[h % UPDATED.length],
    shared: h % 3 === 0,
    private: h % 4 === 0,
    collaborators: (h % 3) + 1,
  };
};

const StatCard = ({ icon: Icon, label, value }) => (
  <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
      <Box sx={{ display: "flex", color: brandColors.primary }}><Icon size={15} /></Box>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color: "text.secondary", textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Stack>
    <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1, color: "text.primary" }}>
      {value}
    </Typography>
  </Box>
);

const CollectionCard = ({ count, title, description, meta, active, onOpen, onMenu, watermark }) => (
  <Box
    onClick={onOpen}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: active ? brandColors.primary : "divider",
      bgcolor: "background.paper",
      overflow: "hidden",
      cursor: "pointer",
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
    }}
  >
    {/* Dark thumbnail */}
    <Box
      sx={{
        position: "relative",
        height: 130,
        background: `linear-gradient(135deg, #16233b 0%, ${brandColors.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {watermark && (
        <Box sx={{ position: "absolute", right: 12, bottom: 4, color: "rgba(255,255,255,0.06)" }}>
          {watermark}
        </Box>
      )}
      <Chip
        label={`${count} Articles`}
        size="small"
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          height: 22,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: "rgba(44,194,149,0.15)",
          color: brandColors.mint,
          border: `1px solid rgba(44,194,149,0.35)`,
        }}
      />
    </Box>
    {/* Body */}
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>{title}</Typography>
        {onMenu && (
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onMenu(e); }} sx={{ mt: -0.5, mr: -0.5, color: "text.secondary" }}>
            <MoreVertical size={16} />
          </IconButton>
        )}
      </Stack>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: 12.5,
          color: "text.secondary",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 34,
        }}
      >
        {description}
      </Typography>
      <Stack direction="row" sx={{ mt: 1.5, justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.secondary" }}>
          <CalendarDays size={13} />
          <Typography sx={{ fontSize: 11.5 }}>Updated {meta.updated}</Typography>
        </Stack>
        {meta.private ? (
          <Chip icon={<Lock size={11} />} label="PRIVATE" size="small" sx={{ height: 20, fontSize: 9, fontWeight: 700, bgcolor: brandColors.hover, color: brandColors.primaryDark, "& .MuiChip-icon": { color: brandColors.primaryDark, ml: 0.5 } }} />
        ) : meta.shared ? (
          <IconButton size="small" sx={{ color: "text.secondary" }}><Share2 size={14} /></IconButton>
        ) : (
          <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 22, height: 22, fontSize: 9, borderColor: "background.paper" } }}>
            {Array.from({ length: meta.collaborators }).map((_, i) => (
              <Avatar key={i} sx={{ bgcolor: brandColors.primary }}>{String.fromCharCode(65 + i)}</Avatar>
            ))}
          </AvatarGroup>
        )}
      </Stack>
    </Box>
  </Box>
);

export default function Collections() {
  const [state, setState] = useState(getState);
  const [active, setActive] = useState(null); // null = grid view
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [addToArticle, setAddToArticle] = useState(null);
  const [menu, setMenu] = useState({ anchor: null, id: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  // The public feed supplies the article details for saved ids that the
  // collections state stores by reference only.
  const [feed, setFeed] = useState(getDiscoverArticles);

  useEffect(() => {
    const unsubscribeCollections = subscribeCollections(setState);
    const unsubscribeDiscover = subscribeDiscover(setFeed);

    refreshCollections();
    refreshDiscover();

    return () => {
      unsubscribeCollections();
      unsubscribeDiscover();
    };
  }, []);

  const savedArticles = getSavedArticles(feed);

  const stats = useMemo(() => {
    const totalInCollections = state.collections.reduce((s, c) => s + c.articleIds.length, 0);
    const totalArticles = state.bookmarks.length + totalInCollections;
    const shared = state.collections.filter((c) => collectionMeta(c.id).shared).length;
    const storage = (totalArticles * 0.08 + 0.4).toFixed(1);
    return {
      totalArticles,
      collections: state.collections.length,
      shared,
      storage: `${storage} GB`,
    };
  }, [state]);

  const activeCollection = state.collections.find((c) => c.id === active);
  const activeArticles =
    active === ALL_SAVED
      ? savedArticles
      : active
      ? getCollectionArticles(active, feed)
      : [];

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCollection(newName.trim());
    setNewName("");
    setNewOpen(false);
  };

  const handleDelete = () => {
    if (active === pendingDelete) setActive(null);
    deleteCollection(pendingDelete);
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
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: brandColors.secondary }}>
              ACTIVE INTELLIGENCE
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ mt: 0.5, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.85rem" }, color: "text.primary" }}>
            Library Collections
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Curated thematic buckets for your high-performance editorial content.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => setNewOpen(true)}
          sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark }, alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Create Collection
        </Button>
      </Stack>

      {/* Stat cards */}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
        <StatCard icon={Library} label="Total Articles" value={stats.totalArticles.toLocaleString()} />
        <StatCard icon={Layers} label="Active Collections" value={stats.collections} />
        <StatCard icon={Users} label="Shared With Team" value={stats.shared} />
        <StatCard icon={HardDrive} label="Storage Used" value={stats.storage} />
      </Box>

      {active ? (
        /* ---- Collection detail view ---- */
        <>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Button size="small" onClick={() => setActive(null)} sx={{ color: "text.secondary", fontWeight: 600 }}>
              ← Back to Collections
            </Button>
            {activeCollection && (
              <Button
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={() => setPendingDelete(activeCollection.id)}
                sx={{ color: "error.main", fontWeight: 600 }}
              >
                Delete Collection
              </Button>
            )}
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
            {active === ALL_SAVED ? "All Saved" : activeCollection?.name}
          </Typography>
          {activeArticles.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                {active === ALL_SAVED ? "Nothing saved yet" : "This collection is empty"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                {active === ALL_SAVED
                  ? "Bookmark articles from Discover to see them here."
                  : "Add saved articles to this collection from the All Saved view."}
              </Typography>
              {active === ALL_SAVED && (
                <Button component={Link} to="/dashboard/discover" variant="outlined" startIcon={<Compass size={15} />} sx={{ mt: 2, color: "text.primary", borderColor: "divider" }}>
                  Go to Discover
                </Button>
              )}
            </Box>
          ) : (
            <ArticleCardGrid>
              {activeArticles.map((item) => (
                <ArticleCard
                  key={item.id}
                  {...item}
                  extraActions={
                    active === ALL_SAVED
                      ? [
                          { label: "Add to Collection", icon: FolderPlus, onClick: () => setAddToArticle(item) },
                          { label: "Remove from Saved", icon: BookmarkX, danger: true, onClick: () => toggleBookmark(item) },
                        ]
                      : [
                          { label: "Remove from this Collection", icon: Trash2, danger: true, onClick: () => removeFromCollection(active, item.id) },
                        ]
                  }
                />
              ))}
            </ArticleCardGrid>
          )}
        </>
      ) : (
        /* ---- Collections grid ---- */
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" } }}>
          <CollectionCard
            count={savedArticles.length}
            title="All Saved"
            description="Everything you've bookmarked from Discover, in one place."
            meta={{ updated: "just now", shared: false, private: false, collaborators: 1 }}
            active={false}
            onOpen={() => setActive(ALL_SAVED)}
            watermark={<BookOpen size={90} />}
          />
          {state.collections.map((c) => (
            <CollectionCard
              key={c.id}
              count={c.articleIds.length}
              title={c.name}
              description={DESCRIPTIONS[c.name] || FALLBACK_DESC}
              meta={collectionMeta(c.id)}
              onOpen={() => setActive(c.id)}
              onMenu={(e) => setMenu({ anchor: e.currentTarget, id: c.id })}
              watermark={<Layers size={90} />}
            />
          ))}
          {/* Add new dashed card */}
          <Box
            onClick={() => setNewOpen(true)}
            sx={{
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "divider",
              minHeight: 262,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "text.secondary",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { borderColor: brandColors.primary, color: brandColors.primary, bgcolor: brandColors.hover },
            }}
          >
            <FolderPlus size={30} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>Add New Collection</Typography>
          </Box>
        </Box>
      )}

      {/* Card menu */}
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, id: null })}>
        <MenuItem onClick={() => { setActive(menu.id); setMenu({ anchor: null, id: null }); }} sx={{ fontSize: 13 }}>
          <ListItemIcon><FolderPlus size={15} /></ListItemIcon>
          Open Collection
        </MenuItem>
        <MenuItem onClick={() => { setPendingDelete(menu.id); setMenu({ anchor: null, id: null }); }} sx={{ fontSize: 13, color: "error.main" }}>
          <ListItemIcon><Trash2 size={15} color="currentColor" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* New collection dialog */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="e.g. Weekend Reading"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add-to-collection dialog */}
      <Dialog open={Boolean(addToArticle)} onClose={() => setAddToArticle(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Add to Collection</DialogTitle>
        <DialogContent>
          {state.collections.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You don't have any collections yet. Create one first.
            </Typography>
          ) : (
            <Stack>
              {state.collections.map((c) => (
                <FormControlLabel
                  key={c.id}
                  control={
                    <Checkbox
                      checked={c.articleIds.includes(addToArticle?.id)}
                      onChange={(e) =>
                        e.target.checked
                          ? addToCollection(c.id, addToArticle)
                          : removeFromCollection(c.id, addToArticle.id)
                      }
                    />
                  }
                  label={c.name}
                />
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddToArticle(null)} sx={{ color: "text.secondary" }}>Done</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete collection?"
        description="This removes the collection. Your saved articles stay in All Saved."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
