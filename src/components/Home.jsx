import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Badge,
  Button,
  Chip,
  Drawer,
  Popover,
  InputBase,
  useMediaQuery,
  useTheme,
  LinearProgress,
} from "@mui/material";
import {
  LayoutDashboard,
  PenLine,
  Sparkles,
  BookOpen,
  BarChart3,
  FolderOpen,
  Archive,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Moon,
  Sun,
  Menu,
  Search,
} from "lucide-react";
import { logoutUser } from "../utils/auth";
import { getProfile, getInitials, subscribeProfile } from "../utils/profileStore";
import { readJSON, writeJSON } from "../utils/storage";
import { getSubscription, subscribeSubscription, planById } from "../utils/planStore";
import { useColorMode } from "../theme/useColorMode";
import { brandColors } from "../theme/muiTheme";
import QuilloraMark from "./brand/QuilloraMark";

const NOTIFICATIONS = [
  { id: "n1", title: "Ava Collins commented on your draft", time: "2m ago" },
  { id: "n2", title: "Your article \"AI Agents\" hit 10K views", time: "1h ago" },
  { id: "n3", title: "Weekly analytics report is ready", time: "3h ago" },
  { id: "n4", title: "Sarah Chen invited you to collaborate", time: "Yesterday" },
];
const READ_KEY = "quillora_notifications_read";

const SIDEBAR_WIDTH = 240;

const navSections = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", end: true },
      { icon: PenLine, label: "Write Article", path: "/dashboard/write" },
      { icon: Sparkles, label: "AI Writer", path: "/dashboard/ai-writer", badge: "NEW" },
      { icon: BookOpen, label: "My Articles", path: "/dashboard/my-article", count: "128" },
      { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    ],
  },
  {
    label: "LIBRARY",
    items: [
      { icon: FolderOpen, label: "Collections", path: "/dashboard/collections" },
      { icon: Archive, label: "Archive", path: "/dashboard/archive" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { icon: Users, label: "Team", path: "/dashboard/team" },
      { icon: Settings, label: "Settings", path: "/dashboard/setting" },
      { icon: HelpCircle, label: "Help Support", path: "/dashboard/help" },
    ],
  },
];

const SidebarContent = ({ onNavigate, onLogout, profile, planName }) => (
  <Box
    sx={{
      width: SIDEBAR_WIDTH,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      background: `linear-gradient(180deg, #16233b 0%, ${brandColors.dark} 100%)`,
      color: "#fff",
    }}
  >
    {/* Logo */}
    <Stack
      component={Link}
      to="/"
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: "center",
        px: 2.5,
        pt: 3,
        pb: 2.5,
        textDecoration: "none"
      }}>
      <QuilloraMark size={36} style={{ flexShrink: 0 }} />
      <Typography variant="h6" sx={{ color: "#fff" }}>
        QuiLLora <Box component="span" sx={{ color: brandColors.mint }}>AI</Box>
      </Typography>
    </Stack>

    {/* Nav sections */}
    <Box sx={{ flex: 1, px: 1.5 }}>
      {navSections.map(({ label, items }) => (
        <Box key={label} sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{ px: 1.5, py: 1, display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.35)" }}
          >
            {label}
          </Typography>
          <Stack spacing={0.25}>
            {items.map(({ icon: Icon, label: itemLabel, path, end, badge, count }) => (
              <Box
                key={itemLabel}
                component={path === "#" ? "div" : NavLink}
                to={path === "#" ? undefined : path}
                end={end}
                onClick={onNavigate}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.06)" },
                  "&.active": {
                    color: brandColors.mint,
                    bgcolor: "rgba(44,194,149,0.12)",
                    fontWeight: 700,
                  },
                }}
              >
                <Icon size={16} />
                <Box component="span" sx={{ flex: 1 }}>{itemLabel}</Box>
                {badge && (
                  <Chip
                    label={badge}
                    size="small"
                    sx={{ height: 16, fontSize: 8, fontWeight: 800, letterSpacing: 0.5, bgcolor: brandColors.mint, color: brandColors.dark }}
                  />
                )}
                {count && (
                  <Typography variant="caption" sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    {count}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>

    {/* AI Credits */}
    <Box sx={{ mx: 2, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: brandColors.darkCard, border: `1px solid ${brandColors.darkBorder}` }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1
        }}>
        <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.45)" }}>
          AI CREDITS
        </Typography>
        <Typography variant="caption" sx={{ color: brandColors.mint, fontWeight: 800 }}>
          2,450
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={72}
        sx={{
          height: 5,
          borderRadius: 99,
          bgcolor: "rgba(255,255,255,0.12)",
          "& .MuiLinearProgress-bar": { bgcolor: brandColors.mint, borderRadius: 99 },
        }}
      />
      <Button
        fullWidth
        size="small"
        component={Link}
        to="/dashboard/upgrade"
        onClick={onNavigate}
        sx={{
          mt: 1.25,
          py: 0.5,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.75)",
          border: `1px solid ${brandColors.darkBorder}`,
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
        }}
      >
        UPGRADE PLAN
      </Button>
    </Box>

    {/* User footer */}
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: "center",
        px: 2,
        py: 2,
        borderTop: `1px solid ${brandColors.darkBorder}`
      }}>
      <Avatar
        component={Link}
        to="/dashboard/profile"
        sx={{ width: 34, height: 34, bgcolor: brandColors.primary, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
      >
        {getInitials(profile.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile.name}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 9, letterSpacing: 0.5, color: "rgba(255,255,255,0.45)" }}>
          {planName.toUpperCase()} ACCOUNT
        </Typography>
      </Box>
      <IconButton size="small" onClick={onLogout} sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}>
        <LogOut size={15} />
      </IconButton>
    </Stack>
  </Box>
);

export const Home = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(getProfile());
  const [subscription, setSubscription] = useState(getSubscription());
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [readIds, setReadIds] = useState(() => readJSON(READ_KEY, []));
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { mode, toggleMode } = useColorMode();

  useEffect(() => subscribeProfile(setProfile), []);
  useEffect(() => subscribeSubscription(setSubscription), []);

  const planName = planById(subscription.planId).name;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const unreadCount = NOTIFICATIONS.filter((n) => !readIds.includes(n.id)).length;

  const markRead = (id) => {
    const next = readIds.includes(id) ? readIds : [...readIds, id];
    setReadIds(next);
    writeJSON(READ_KEY, next);
  };

  const markAllRead = () => {
    const next = NOTIFICATIONS.map((n) => n.id);
    setReadIds(next);
    writeJSON(READ_KEY, next);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: brandColors.bgSecondary }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <SidebarContent onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} profile={profile} planName={planName} />
        </Drawer>
      ) : (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, position: "fixed", top: 0, bottom: 0, left: 0 }}>
          <SidebarContent onLogout={handleLogout} profile={profile} planName={planName} />
        </Box>
      )}
      {/* Main */}
      <Box sx={{ flex: 1, minWidth: 0, ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            px: { xs: 2, md: 3 },
            py: 1.25,
            bgcolor: "background.paper",
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 10
          }}>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} size="small">
              <Menu size={20} />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                width: { xs: "100%", sm: 360 },
                maxWidth: 460,
                px: 1.5,
                py: 0.85,
                borderRadius: 2.5,
                bgcolor: brandColors.bgSecondary,
                border: "1px solid",
                borderColor: "divider",
                transition: "border-color 0.15s",
                "&:focus-within": { borderColor: brandColors.primary },
              }}
            >
              <Search size={16} color={brandColors.text} />
              <InputBase
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) navigate("/dashboard/discover");
                }}
                placeholder="Search articles, collections, people..."
                sx={{ flex: 1, fontSize: 13.5, color: "text.primary", "& input::placeholder": { color: "text.secondary", opacity: 1 } }}
              />
            </Stack>
          </Box>

          <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge variant="dot" color="error" overlap="circular" invisible={unreadCount === 0}>
              <Bell size={17} />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ width: 300, maxWidth: "90vw" }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider"
                }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>Notifications</Typography>
                <Typography
                  variant="caption"
                  onClick={markAllRead}
                  sx={{ fontWeight: 600, color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Mark all read
                </Typography>
              </Stack>
              <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                {NOTIFICATIONS.map((n) => {
                  const isRead = readIds.includes(n.id);
                  return (
                    <Stack
                      key={n.id}
                      direction="row"
                      spacing={1}
                      onClick={() => markRead(n.id)}
                      sx={{
                        alignItems: "flex-start",
                        px: 2,
                        py: 1.5,
                        cursor: "pointer",
                        "&:hover": { bgcolor: brandColors.hover }
                      }}>
                      <Box sx={{ width: 6, height: 6, mt: 0.6, flexShrink: 0, borderRadius: "50%", bgcolor: isRead ? "transparent" : brandColors.secondary }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: isRead ? 400 : 600 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{n.time}</Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          </Popover>
          <IconButton size="small" onClick={toggleMode} aria-label="Toggle color mode">
            {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>

          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
              pl: 1.5,
              borderLeft: "1px solid",
              borderColor: "divider"
            }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                {profile.name}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: 9, letterSpacing: 0.5, color: "text.secondary" }}>
                EDITOR-IN-CHIEF
              </Typography>
            </Box>
            <Avatar
              component={Link}
              to="/dashboard/profile"
              sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}
            >
              {getInitials(profile.name)}
            </Avatar>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
