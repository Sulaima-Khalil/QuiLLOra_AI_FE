import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Button,
  Chip,
  Drawer,
  Popover,
  InputBase,
  useMediaQuery,
  useTheme,
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
  BellOff,
  Moon,
  Sun,
  Menu,
  Search,
  X,
} from "lucide-react";
import { logoutUser } from "../utils/auth";
import { getProfile, getInitials, subscribeProfile } from "../utils/profileStore";
import { getSubscription, subscribeSubscription, fetchSubscription, planById } from "../utils/planStore";
import { getSummary, refreshSummary, subscribeSummary } from "../utils/analyticsStore";
import { useColorMode } from "../theme/useColorMode";
import { brandColors } from "../theme/muiTheme";
import QuilloraMark from "./brand/QuilloraMark";
import SkipLink from "./shared/SkipLink";
import { mainContentProps } from "./shared/skipTarget";

/*
 * Notifications
 *
 * There is no notification API: the backend exposes no endpoint that produces,
 * lists or marks these. What used to sit here was a fixed array of invented
 * events ("Ava Collins commented on your draft") with read state kept in
 * localStorage, which read as a real activity feed and was not one.
 *
 * Rather than dress fabricated events up as data, the panel now says plainly
 * that the feature is not wired up yet. The unread dot is gone with it — a
 * badge counting invented items is the most misleading part of the pattern.
 */

const SIDEBAR_WIDTH = 240;

const navSections = [
  {
    label: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", end: true },
      { icon: PenLine, label: "Editor", path: "/dashboard/write" },
      { icon: BookOpen, label: "My Articles", path: "/dashboard/my-article", countKey: "articles" },
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

const SidebarContent = ({ onNavigate, onLogout, profile, planName, articleCount }) => (
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
    <Box component="nav" aria-label="Workspace" sx={{ flex: 1, px: 1.5 }}>
      {navSections.map(({ label, items }) => (
        <Box key={label} sx={{ mb: 1.5 }}>
          {/*
            The heading names the group below it. Without the aria-labelledby
            on the list, a screen reader reads eleven links in a row with no
            hint that they fall into Main, Library and System.
          */}
          <Typography
            id={`nav-group-${label.toLowerCase()}`}
            variant="caption"
            sx={{ px: 1.5, py: 1, display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.55)" }}
          >
            {label}
          </Typography>
          {/*
            `role="group"` is load-bearing, not decoration: aria-labelledby on
            a plain div is ignored, so without a role that accepts a name the
            heading above would not actually be associated with anything.
          */}
          <Stack
            spacing={0.25}
            role="group"
            aria-labelledby={`nav-group-${label.toLowerCase()}`}
          >
            {items.map(({ icon: Icon, label: itemLabel, path, end, badge, countKey }) => {
              const count = countKey === "articles" ? articleCount : undefined;

              return (
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
                {count !== undefined && count !== null && (
                  <Typography variant="caption" sx={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                    {count}
                  </Typography>
                )}
              </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Box>

    {/*
      AI usage

      This used to read "2,450" credits over a 72% bar. Neither number came
      from anywhere: there is no usage or credits endpoint, and the AI routes
      are guarded only by a 20-requests-per-minute abuse limiter, which is not
      a quota. Showing the plan the account is on is honest and useful; a
      fabricated balance is not.
    */}
    <Box sx={{ mx: 2, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: brandColors.darkCard, border: `1px solid ${brandColors.darkBorder}` }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.75
        }}>
        <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.6)" }}>
          AI USAGE
        </Typography>
        <Typography variant="caption" sx={{ color: brandColors.mint, fontWeight: 800 }}>
          {planName}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ display: "block", fontSize: 10.5, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
        Usage tracking isn&apos;t available yet.
      </Typography>
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
      {/*
        The initials alone were this link's accessible name, so it announced
        as "SK, link" — the avatar is decoration, and the destination is what
        the name should describe.
      */}
      <Avatar
        component={Link}
        to="/dashboard/profile"
        aria-label="Your profile"
        sx={{ width: 34, height: 34, bgcolor: brandColors.primary, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
      >
        <span aria-hidden="true">{getInitials(profile.name)}</span>
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile.name}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 9, letterSpacing: 0.5, color: "rgba(255,255,255,0.6)" }}>
          {planName.toUpperCase()} ACCOUNT
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onLogout}
        aria-label="Sign out"
        sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}
      >
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
  const [summary, setSummary] = useState(getSummary);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { mode, toggleMode } = useColorMode();

  // The URL owns the query, so the box still shows it after a submit, a
  // refresh, or someone opening a shared search link.
  const submittedQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(submittedQuery);
  const [syncedQuery, setSyncedQuery] = useState(submittedQuery);

  useEffect(() => subscribeProfile(setProfile), []);
  useEffect(() => {
    const unsubscribe = subscribeSubscription(setSubscription);
    fetchSubscription().catch(() => {});
    return unsubscribe;
  }, []);

  // One request for the shell, shared with the Profile page through the store
  // rather than each screen fetching its own copy of the same totals.
  useEffect(() => {
    const unsubscribe = subscribeSummary(setSummary);
    refreshSummary();
    return unsubscribe;
  }, []);

  // Follow the URL when it changes underneath the box — a back button, or the
  // "Clear search" control on Discover. Adjusted during render rather than in
  // an effect, so the box never paints one frame of a stale query.
  if (syncedQuery !== submittedQuery) {
    setSyncedQuery(submittedQuery);
    setSearch(submittedQuery);
  }

  const submitSearch = () => {
    const term = search.trim();
    if (!term) return;
    // Submitting the query already on screen would refetch for nothing.
    if (term === submittedQuery && location.pathname === "/dashboard/discover") return;

    navigate(`/dashboard/discover?q=${encodeURIComponent(term)}`);
  };

  const clearSearch = () => {
    setSearch("");
    if (submittedQuery) navigate("/dashboard/discover", { replace: true });
  };

  const planName = planById(subscription.planId).name;
  // Undefined until the totals land, which keeps the chip absent rather than
  // flashing a zero the author has not earned.
  const articleCount = summary?.totalArticles;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: brandColors.bgSecondary }}>
      <SkipLink />

      {/* Sidebar */}
      {isMobile ? (
        /*
          MUI's Drawer is a modal by default: it traps focus, restores it to
          the trigger on close and closes on Escape. None of that is
          reimplemented here — only the label it cannot infer is supplied.
        */
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          aria-label="Workspace navigation"
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} profile={profile} planName={planName} articleCount={articleCount} />
        </Drawer>
      ) : (
        <Box component="aside" sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, position: "fixed", top: 0, bottom: 0, left: 0 }}>
          <SidebarContent onLogout={handleLogout} profile={profile} planName={planName} articleCount={articleCount} />
        </Box>
      )}
      {/* Main */}
      <Box sx={{ flex: 1, minWidth: 0, ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <Stack
          component="header"
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
            <IconButton
              onClick={() => setMobileOpen(true)}
              size="small"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
            >
              <Menu size={20} />
            </IconButton>
          )}
          {/*
            A search field submitted with Enter, so it is a real form: Enter
            already worked, but without the form element the control announced
            as a bare textbox rather than as search, and browsers offered no
            "go" affordance on touch keyboards.
          */}
          <Box
            component="form"
            role="search"
            aria-label="Search the workspace"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            sx={{ flex: 1, minWidth: 0, display: "flex" }}
          >
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
              <Search size={16} color={brandColors.text} aria-hidden="true" />
              <InputBase
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  // Enter is the form's job now; Escape clearing the box is a
                  // convention forms do not provide.
                  if (e.key === "Escape") clearSearch();
                }}
                /*
                  Left as a plain text input rather than `type="search"`: the
                  form landmark above already conveys the purpose, and the
                  native type would add a second clear button beside the one
                  this control already renders.
                */
                inputProps={{
                  "aria-label": "Search articles, collections and people",
                  enterKeyHint: "search",
                }}
                placeholder="Search articles, collections, people..."
                sx={{ flex: 1, fontSize: 13.5, color: "text.primary", "& input::placeholder": { color: "text.secondary", opacity: 1 } }}
              />
              {search && (
                <IconButton
                  type="button"
                  size="small"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  sx={{ p: 0.25, color: "text.secondary", "&:hover": { color: brandColors.mint } }}
                >
                  <X size={14} />
                </IconButton>
              )}
            </Stack>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={Boolean(notifAnchor)}
            aria-controls={notifAnchor ? "notifications-panel" : undefined}
          >
            <Bell size={17} />
          </IconButton>
          <Popover
            id="notifications-panel"
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { "aria-labelledby": "notifications-heading" } }}
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
                <Typography id="notifications-heading" variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Notifications
                </Typography>
              </Stack>
              <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", px: 2.5, py: 4 }}>
                <BellOff size={22} color={brandColors.outline} aria-hidden="true" />
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                  Notifications aren&apos;t available yet
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Comments, mentions and analytics alerts will appear here once the
                  notification service is live.
                </Typography>
              </Stack>
            </Box>
          </Popover>
          {/*
            Names the outcome, not the control. "Toggle color mode" left a
            screen-reader user with no way to know which mode they were in;
            the icon that conveys it sighted-only is now hidden.
          */}
          <IconButton
            size="small"
            onClick={toggleMode}
            aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {mode === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
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
              aria-label="Your profile"
              sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 13, fontWeight: 700 }}
            >
              <span aria-hidden="true">{getInitials(profile.name)}</span>
            </Avatar>
          </Stack>
        </Stack>

        <Box component="main" {...mainContentProps()} sx={{ flex: 1, p: { xs: 2, md: 3 }, outline: "none" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
