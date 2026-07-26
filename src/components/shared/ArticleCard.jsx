import { useState } from "react";
import { Box, Typography, Stack, Chip, Avatar, IconButton, Menu, MenuItem, ListItemIcon } from "@mui/material";
import { Clock, MoreVertical, Pencil, Trash2, Archive as ArchiveIcon, Bookmark, BookOpen } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

/*
 * Status pills.
 *
 * These are the app's only light-on-light surfaces, and the original text
 * colours were carried over from the palette's dark-background values: the
 * teal read 2.9:1 on the mint tint and the grey 2.7:1 on the stone one, both
 * under the 4.5:1 that 11px bold text needs. The tints are unchanged — only
 * the ink is darkened, to 6.5:1 and 7.4:1.
 */
const statusStyles = {
  Published: { bgcolor: "#DFF7EE", color: "#0a5f55" },
  Draft: { bgcolor: "#EEF1F0", color: "#454e5e" },
  Archived: { bgcolor: "#EEF1F0", color: "#454e5e" },
};

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  return words.length === 1
    ? words[0][0].toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();
};

export const ArticleCard = ({ img, title, description, category, author, date, readingTime, status, onRead, onEdit, onDelete, onArchive, bookmarked, onToggleBookmark, extraActions }) => {
  const [anchor, setAnchor] = useState(null);
  const hasActions = onRead || onEdit || onDelete || onArchive || extraActions?.length;

  /*
   * Reading is the card's primary action, and there is exactly one control
   * for it: the title.
   *
   * It used to be two. The cover image and the title each carried
   * `role="link"`, `tabIndex={0}` and a hand-rolled Enter/Space handler, so
   * keyboard users hit two stops for one destination and heard the title
   * twice — once as the image's alt text, once as the heading. Making the
   * title a real <button> deletes the custom key handling along with the
   * duplicate: the browser already gives a button Enter, Space, focus and the
   * right role.
   *
   * The cover keeps its click for pointer users; it is no longer a tab stop
   * and no longer describes itself, because the title beneath it already does.
   */
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
          alt=""
          onClick={onRead}
          sx={{
            width: "100%",
            height: { xs: 160, sm: 190 },
            objectFit: "cover",
            display: "block",
            ...(onRead ? { cursor: "pointer" } : null),
          }}
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
          {...(onRead
            ? { component: "button", type: "button", onClick: onRead }
            : {})}
          sx={{
            fontWeight: 700,
            color: "text.primary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            ...(onRead
              ? {
                  // Strip the user-agent button chrome; the card's look is
                  // unchanged, only the element underneath it is honest now.
                  appearance: "none",
                  background: "none",
                  border: 0,
                  padding: 0,
                  margin: 0,
                  font: "inherit",
                  textAlign: "left",
                  width: "100%",
                  cursor: "pointer",
                  "&:hover": { color: brandColors.mint },
                }
              : null),
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
        {/* The author's name is spelled out beside it; the initials are the
            same information rendered as decoration. */}
        <Avatar aria-hidden="true" sx={{ width: 30, height: 30, fontSize: 12, fontWeight: 700, bgcolor: brandColors.primary }}>
          {getInitials(author)}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", flex: 1, minWidth: 0 }}>
          {author}
        </Typography>
        {hasActions && (
          <>
            {/*
              A grid of identical "More" buttons tells a screen-reader user
              nothing about which article each one acts on, so the title goes
              into the name. MUI's Menu owns the arrow-key navigation, the
              typeahead and the focus return — none of that is re-added here.
            */}
            <IconButton
              size="small"
              onClick={(e) => setAnchor(e.currentTarget)}
              aria-label={`More actions for ${title}`}
              aria-haspopup="menu"
              aria-expanded={Boolean(anchor)}
              sx={{ color: "text.secondary" }}
            >
              <MoreVertical size={16} aria-hidden="true" />
            </IconButton>
            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={close}
              slotProps={{ list: { "aria-label": `Actions for ${title}` } }}
            >
              {onRead && (
                <MenuItem onClick={runAction(onRead)} sx={{ fontSize: 13 }}>
                  <ListItemIcon><BookOpen size={15} /></ListItemIcon>
                  Read article
                </MenuItem>
              )}
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
