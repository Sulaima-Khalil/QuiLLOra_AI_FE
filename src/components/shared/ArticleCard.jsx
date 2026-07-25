import { useState } from "react";
import { Box, Typography, Stack, Chip, Avatar, IconButton, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { Clock, MoreVertical, Pencil, Trash2, Archive as ArchiveIcon, Bookmark } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

const statusStyles = {
  Published: { bgcolor: "#DFF7EE", color: brandColors.primary },
  Draft: { bgcolor: "#EEF1F0", color: brandColors.text },
  Archived: { bgcolor: "#EEF1F0", color: brandColors.text },
};

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  return words.length === 1
    ? words[0][0].toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
};

export const ArticleCard = ({ img, title, description, category, author, date, readingTime, status, onEdit, onDelete, onArchive, bookmarked, onToggleBookmark, extraActions }) => {
  const [anchor, setAnchor] = useState(null);
  const hasActions = onEdit || onDelete || onArchive || extraActions?.length;

  const close = () => setAnchor(null);
  const runAction = (fn) => () => {
    close();
    fn?.();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: 1,
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: 3, transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={img}
          alt={title}
          sx={{ width: "100%", height: { xs: 160, sm: 190 }, objectFit: "cover", display: "block" }}
        />
        {category && (
          <Chip
            label={category}
            size="small"
            sx={{ position: "absolute", top: 12, left: 12, height: 22, fontSize: 11, fontWeight: 700, bgcolor: brandColors.dark, color: "#fff" }}
          />
        )}
        {status && (
          <Chip
            label={status}
            size="small"
            sx={{ position: "absolute", top: 12, right: 12, height: 22, fontSize: 11, fontWeight: 700, ...statusStyles[status] }}
          />
        )}
        {onToggleBookmark && (
          <IconButton
            size="small"
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Save to collection"}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(12,43,38,0.55)",
              color: bookmarked ? brandColors.mint : "#fff",
              "&:hover": { bgcolor: "rgba(12,43,38,0.75)" },
            }}
          >
            <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
          </IconButton>
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 1.5,
          color: "text.secondary"
        }}>
        <Typography variant="caption">{date}</Typography>
        <Stack direction="row" spacing={0.5} sx={{
          alignItems: "center"
        }}>
          <Clock size={12} />
          <Typography variant="caption">{readingTime}</Typography>
        </Stack>
      </Stack>
      <Box sx={{ px: 2, pt: 1, flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: "center",
          p: 2
        }}>
        <Avatar sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: brandColors.primary }}>
          {getInitials(author)}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", flex: 1, minWidth: 0 }}>
          {author}
        </Typography>
        {hasActions && (
          <>
            <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: "text.secondary" }}>
              <MoreVertical size={16} />
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
              {onEdit && (
                <MenuItem onClick={runAction(onEdit)} sx={{ fontSize: 13 }}>
                  <ListItemIcon><Pencil size={15} /></ListItemIcon>
                  Edit
                </MenuItem>
              )}
              {onArchive && (
                <MenuItem onClick={runAction(onArchive)} sx={{ fontSize: 13 }}>
                  <ListItemIcon><ArchiveIcon size={15} /></ListItemIcon>
                  {status === "Archived" ? "Restore" : "Archive"}
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem onClick={runAction(onDelete)} sx={{ fontSize: 13, color: "error.main" }}>
                  <ListItemIcon><Trash2 size={15} color="currentColor" /></ListItemIcon>
                  Delete
                </MenuItem>
              )}
              {extraActions?.map(({ label, icon: Icon, onClick, danger }) => (
                <MenuItem key={label} onClick={runAction(onClick)} sx={{ fontSize: 13, color: danger ? "error.main" : "text.primary" }}>
                  {Icon && <ListItemIcon><Icon size={15} color="currentColor" /></ListItemIcon>}
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Stack>
    </Box>
  );
};

export const ArticleCardGrid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gap: { xs: 2, sm: 2.5, md: 3 },
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      },
    }}
  >
    {children}
  </Box>
);
