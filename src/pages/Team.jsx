import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  UserPlus,
  MoreVertical,
  Shield,
  ShieldCheck,
  PencilLine,
  Eye,
  Users,
  FileText,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Clock,
  Mail,
  Trash2,
  RefreshCw,
  Link2,
  Check,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { getInitials } from "../utils/profileStore";
import { FilterInput } from "../components/shared/FilterInput";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { capability, fetchEntitlements, subscribeEntitlements } from "../utils/entitlementsStore";
import {
  getArticles,
  refreshArticles,
  subscribeArticles,
} from "../utils/articlesStore";
import {
  getTeam,
  getRoles,
  isTeamLoaded,
  refreshTeam,
  inviteMember,
  updateMemberRole,
  removeMember,
  subscribeTeam,
} from "../utils/teamStore";
import { scrollIntoViewGently } from "../utils/motion";

const ANY = "All";

/** Membership states the API reports on every member row. */
const STATUS = { ACTIVE: "Active", INVITED: "Invited" };

const SORTS = [
  { key: "recent", label: "Recently joined" },
  { key: "name", label: "Name (A–Z)" },
  { key: "role", label: "Role" },
];

const PREVIEW_COUNT = 5;

/** What each role is meant to be able to do, keyed by the API's role names. */
const ROLE_CAPABILITIES = {
  Admin: {
    icon: ShieldCheck,
    summary: "Full workspace control — invite members, change roles, publish and delete.",
  },
  Editor: {
    icon: PencilLine,
    summary: "Write, edit and publish articles. Cannot manage workspace members.",
  },
  Viewer: {
    icon: Eye,
    summary: "Read-only access to workspace articles and analytics.",
  },
};

const roleChipSx = (role) =>
  role === "Admin"
    ? { bgcolor: brandColors.primary, color: "#fff" }
    : { bgcolor: brandColors.hover, color: brandColors.mint };

/** `"2 hours ago"` — used for invitation activity. */
const relativeTime = (value) => {
  const then = new Date(value ?? "").getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.round(Math.max(0, Date.now() - then) / 60000);
  if (minutes < 1) return "just now";

  const steps = [
    { size: 1, limit: 60, label: "minute" },
    { size: 60, limit: 24, label: "hour" },
    { size: 60 * 24, limit: 30, label: "day" },
    { size: 60 * 24 * 30, limit: 12, label: "month" },
    { size: 60 * 24 * 365, limit: Infinity, label: "year" },
  ];

  for (const step of steps) {
    const count = Math.max(1, Math.round(minutes / step.size));
    if (count < step.limit) return `${count} ${step.label}${count === 1 ? "" : "s"} ago`;
  }

  return "";
};

const StatCard = ({ icon: Icon, chip, value, sub }) => (
  <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", minHeight: 132, display: "flex", flexDirection: "column" }}>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: brandColors.hover, color: brandColors.primary }}>
        <Icon size={19} />
      </Box>
      {chip && (
        <Chip label={chip} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: "rgba(44,194,149,0.15)", color: brandColors.primary }} />
      )}
    </Stack>
    <Box sx={{ flex: 1 }} />
    <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>{sub}</Typography>
  </Box>
);

const CapabilityRow = ({ icon: Icon, role, count, summary }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ display: "flex", pt: 0.25, color: brandColors.primary }}><Icon size={17} /></Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>{role}</Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>{summary}</Typography>
    </Box>
    <Chip
      label={count === 1 ? "1 member" : `${count} members`}
      size="small"
      sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: brandColors.hover, color: brandColors.mint }}
    />
  </Stack>
);

export default function Team() {
  const [team, setTeam] = useState(getTeam);
  const [articles, setArticles] = useState(getArticles);
  const [loading, setLoading] = useState(!isTeamLoaded());
  const [loadError, setLoadError] = useState("");

  // List controls — the filter and sort buttons in the Collaborators header.
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(ANY);
  const [statusFilter, setStatusFilter] = useState(ANY);
  const [sortBy, setSortBy] = useState("recent");
  const [showAll, setShowAll] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);

  const [menu, setMenu] = useState({ anchor: null, member: null });
  const [busyId, setBusyId] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");
  const [inviteRoleAnchor, setInviteRoleAnchor] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [seats, setSeats] = useState(() => capability("teamMembers"));

  const [notice, setNotice] = useState(null);

  const permissionsRef = useRef(null);
  const roles = getRoles();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // The store fans the result out through subscribeTeam.
      await refreshTeam();
    } catch (error) {
      setLoadError(error?.response?.data?.message || "Could not load your team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribeTeam = subscribeTeam(setTeam);
    const unsubscribeArticles = subscribeArticles(setArticles);

    // Seat headroom, so a full workspace is explained before an invite is
    // attempted. Advisory only — the server enforces the seat count.
    const unsubscribeSeats = subscribeEntitlements(() => setSeats(capability("teamMembers")));

    load();
    // Powers the "published this month" card; a failure there must not break
    // the page, so the rejection is swallowed deliberately.
    refreshArticles().catch(() => {});
    fetchEntitlements().then(() => setSeats(capability("teamMembers")));

    return () => {
      unsubscribeTeam();
      unsubscribeArticles();
      unsubscribeSeats();
    };
  }, [load]);

  const closeMenu = () => setMenu({ anchor: null, member: null });

  /* ---- Derived data ---------------------------------------------------- */

  const roleCounts = useMemo(
    () =>
      roles.reduce((acc, role) => {
        acc[role] = team.filter((member) => member.role === role).length;
        return acc;
      }, {}),
    [team, roles],
  );

  const roleSummary = useMemo(
    () =>
      roles
        .map((role) => ({ role, count: roleCounts[role] ?? 0 }))
        .filter((entry) => entry.count > 0)
        .map((entry) => `${entry.count} ${entry.role}${entry.count > 1 ? "s" : ""}`)
        .join(", "),
    [roleCounts, roles],
  );

  const pendingInvites = useMemo(
    () =>
      team
        .filter((member) => member.status === STATUS.INVITED)
        .sort((a, b) => new Date(b.joinedAt ?? 0) - new Date(a.joinedAt ?? 0)),
    [team],
  );

  const activeCount = useMemo(
    () => team.filter((member) => member.status === STATUS.ACTIVE).length,
    [team],
  );

  /** The four most recent memberships, whatever their state. */
  const recentActivity = useMemo(
    () => [...team].sort((a, b) => new Date(b.joinedAt ?? 0) - new Date(a.joinedAt ?? 0)).slice(0, 4),
    [team],
  );

  const publishedThisMonth = useMemo(() => {
    const now = new Date();
    return articles.filter((article) => {
      if (article.status !== "Published") return false;
      const at = new Date(article.publishedAt ?? article.createdAt ?? "");
      return (
        !Number.isNaN(at.getTime()) &&
        at.getMonth() === now.getMonth() &&
        at.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [articles]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const matches = team.filter((member) => {
      if (roleFilter !== ANY && member.role !== roleFilter) return false;
      if (statusFilter !== ANY && member.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        member.name?.toLowerCase().includes(needle) ||
        member.email?.toLowerCase().includes(needle)
      );
    });

    const byName = (a, b) => (a.name ?? "").localeCompare(b.name ?? "");

    if (sortBy === "name") return matches.sort(byName);
    if (sortBy === "role") {
      return matches.sort(
        (a, b) => roles.indexOf(a.role) - roles.indexOf(b.role) || byName(a, b),
      );
    }
    return matches.sort((a, b) => new Date(b.joinedAt ?? 0) - new Date(a.joinedAt ?? 0));
  }, [team, query, roleFilter, statusFilter, sortBy, roles]);

  const visibleMembers = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
  const isFiltering = Boolean(query.trim()) || roleFilter !== ANY || statusFilter !== ANY;

  /* ---- Mutations ------------------------------------------------------- */

  const handleInvite = async () => {
    const address = inviteEmail.trim();

    // The API requires the address and derives a display name when none is
    // given, so email — not name — is the mandatory field.
    if (!address) {
      setInviteError("An email address is required to send an invite.");
      return;
    }

    setInviting(true);
    setInviteError("");
    try {
      await inviteMember(inviteName, address, inviteRole);
      setNotice({ severity: "success", message: `Invitation sent to ${address}.` });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Editor");
      setInviteOpen(false);
    } catch (error) {
      setInviteError(error?.response?.data?.message || "Could not send that invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (member, role) => {
    closeMenu();
    if (member.role === role) return;

    setBusyId(member.id);
    try {
      await updateMemberRole(member.id, role);
      setNotice({ severity: "success", message: `${member.name} is now ${role}.` });
    } catch (error) {
      setNotice({
        severity: "error",
        message: error?.response?.data?.message || "Could not update that role.",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async () => {
    const member = pendingRemove;
    setPendingRemove(null);
    if (!member) return;

    setBusyId(member.id);
    try {
      await removeMember(member.id);
      setNotice({ severity: "success", message: `${member.name} was removed from the team.` });
    } catch (error) {
      setNotice({
        severity: "error",
        message: error?.response?.data?.message || "Could not remove that member.",
      });
    } finally {
      setBusyId(null);
    }
  };

  /**
   * The backend's invite email points the invitee at the register page with
   * their address prefilled; this reproduces that link for sharing by hand,
   * which also covers the case where the email failed to send.
   */
  const handleCopyInviteLink = async (member) => {
    closeMenu();
    const link = `${window.location.origin}/register?email=${encodeURIComponent(member.email)}`;
    try {
      await navigator.clipboard.writeText(link);
      setNotice({ severity: "success", message: "Invite link copied to your clipboard." });
    } catch {
      setNotice({ severity: "error", message: "Could not copy the link. Copy it manually instead." });
    }
  };

  const resetFilters = () => {
    setQuery("");
    setRoleFilter(ANY);
    setStatusFilter(ANY);
    setFilterAnchor(null);
  };

  /* ---- Render ---------------------------------------------------------- */

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
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: brandColors.secondary }}>
              WORKSPACE
            </Typography>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
          </Stack>
          <Typography variant="h4" sx={{ mt: 0.5, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.85rem" }, color: "text.primary" }}>
            Team Management
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", maxWidth: 460 }}>
            Orchestrate your editorial workflow by managing roles, permissions, and team collaboration.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}>
          <Tooltip title="Reload the team">
            {/* Wrapped: MUI cannot listen for events on a disabled button. */}
            <Box component="span" sx={{ display: "inline-flex" }}>
              <IconButton
                onClick={load}
                disabled={loading}
                sx={{ border: "1px solid", borderColor: "divider", color: "text.secondary", borderRadius: 2 }}
              >
                <RefreshCw size={16} />
              </IconButton>
            </Box>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<UserPlus size={16} />}
            onClick={() => { setInviteError(""); setInviteOpen(true); }}
            sx={{ flex: { xs: 1, sm: "none" }, bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Invite Member
          </Button>
        </Stack>
      </Stack>

      {/* Top cards */}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        <StatCard
          icon={Users}
          chip={activeCount > 0 ? `${activeCount} Active` : undefined}
          value={team.length === 1 ? "1 Member" : `${team.length} Members`}
          sub={roleSummary || "No members yet — invite someone to get started"}
        />
        <StatCard
          icon={FileText}
          chip={pendingInvites.length > 0 ? `${pendingInvites.length} Pending` : undefined}
          value={publishedThisMonth === 1 ? "1 Article" : `${publishedThisMonth} Articles`}
          sub="Published this month in your workspace"
        />
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            minHeight: 132,
            border: "1px solid",
            borderColor: "rgba(45,212,191,0.25)",
            background: `linear-gradient(135deg, #16233b 0%, ${brandColors.dark} 100%)`,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
            Define what your editors and writers can access.
          </Typography>
          <Button
            endIcon={<ArrowRight size={15} />}
            onClick={() => scrollIntoViewGently(permissionsRef.current, { block: "center" })}
            sx={{ alignSelf: "flex-start", p: 0, color: brandColors.mint, fontWeight: 700, "&:hover": { bgcolor: "transparent", opacity: 0.85 } }}
          >
            Configure Permissions
          </Button>
        </Box>
      </Box>

      {/* Collaborators */}
      <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Collaborators</Typography>
            {isFiltering && (
              <Chip
                label={`${filtered.length} of ${team.length}`}
                size="small"
                onDelete={resetFilters}
                sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: brandColors.hover, color: brandColors.mint }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <FilterInput
              value={query}
              onChange={setQuery}
              placeholder="Search name or email"
              sx={{ display: { xs: "none", sm: "flex" }, width: 210, py: 0.5 }}
            />
            <Tooltip title="Filter">
              <IconButton
                size="small"
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                sx={{ color: roleFilter !== ANY || statusFilter !== ANY ? brandColors.primary : "text.secondary" }}
              >
                <Filter size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton size="small" onClick={(e) => setSortAnchor(e.currentTarget)} sx={{ color: "text.secondary" }}>
                <SlidersHorizontal size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <FilterInput
          value={query}
          onChange={setQuery}
          placeholder="Search name or email"
          sx={{ display: { xs: "flex", sm: "none" }, mb: 1.5 }}
        />

        {loading ? (
          <Stack sx={{ alignItems: "center", py: 5 }}>
            <CircularProgress size={26} sx={{ color: brandColors.primary }} />
          </Stack>
        ) : loadError ? (
          <Alert
            severity="error"
            action={<Button size="small" onClick={load} sx={{ fontWeight: 700 }}>Retry</Button>}
            sx={{ borderRadius: 2 }}
          >
            {loadError}
          </Alert>
        ) : filtered.length === 0 ? (
          <Stack sx={{ alignItems: "center", textAlign: "center", py: 5 }} spacing={1}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
              {team.length === 0 ? "No collaborators yet" : "No members match those filters"}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 340 }}>
              {team.length === 0
                ? "Invite an editor or writer and they will appear here as soon as the invitation is sent."
                : "Try a different search term, or clear the active filters."}
            </Typography>
            {team.length === 0 ? (
              <Button
                variant="outlined"
                startIcon={<UserPlus size={15} />}
                onClick={() => { setInviteError(""); setInviteOpen(true); }}
                sx={{ mt: 1, color: "text.primary", borderColor: "divider" }}
              >
                Invite Member
              </Button>
            ) : (
              <Button onClick={resetFilters} sx={{ mt: 1, fontWeight: 700, color: brandColors.primary }}>
                Clear filters
              </Button>
            )}
          </Stack>
        ) : (
          <>
            <Stack>
              {visibleMembers.map((member) => {
                const active = member.status === STATUS.ACTIVE;
                const busy = busyId === member.id;

                return (
                  <Stack
                    key={member.id}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      py: 1.5,
                      opacity: busy ? 0.55 : 1,
                      transition: "opacity 0.15s",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: "none" },
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: brandColors.primary }}>
                      {member.initials || getInitials(member.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>{member.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email}
                      </Typography>
                    </Box>
                    {/*
                      `describeChild` matters here. By default MUI applies the
                      tooltip title as the child's `aria-label`, which would
                      have replaced the role chip's own text with the join date
                      — and replaced it with an empty string for a member who
                      has no join date, leaving the chip nameless. As a
                      description it is additive instead.
                    */}
                    <Tooltip
                      describeChild
                      title={member.joined ? `Joined ${member.joined}` : ""}
                    >
                      <Chip
                        label={member.role}
                        size="small"
                        sx={{ height: 22, fontSize: 10.5, fontWeight: 700, ...roleChipSx(member.role) }}
                      />
                    </Tooltip>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", width: 74 }}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: active ? brandColors.secondary : brandColors.accentGold,
                        }}
                      />
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{member.status}</Typography>
                    </Stack>
                    {busy ? (
                      <Box sx={{ width: 34, display: "flex", justifyContent: "center" }}>
                        <CircularProgress size={15} sx={{ color: brandColors.primary }} />
                      </Box>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={(e) => setMenu({ anchor: e.currentTarget, member })}
                        aria-label={`More actions for ${member.name}`}
                        aria-haspopup="menu"
                        sx={{ color: "text.secondary" }}
                      >
                        <MoreVertical size={16} aria-hidden="true" />
                      </IconButton>
                    )}
                  </Stack>
                );
              })}
            </Stack>
            {filtered.length > PREVIEW_COUNT && (
              <Box sx={{ textAlign: "center", pt: 1.5 }}>
                <Typography
                  component="button"
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  aria-expanded={showAll}
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: brandColors.primary,
                    cursor: "pointer",
                    font: "inherit",
                    border: 0,
                    background: "none",
                    padding: 0,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {showAll ? "Show fewer" : `View all ${filtered.length} members`}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Permissions + Invitations */}
      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {/* Role capabilities */}
        <Box ref={permissionsRef} sx={{ display: "flex", flexDirection: "column", scrollMarginTop: 24 }}>
          <Box sx={{ mb: 1.5, minHeight: { md: 52 } }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Team Permissions</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
              What each role covers. Assign one from any member's menu.
            </Typography>
          </Box>
          <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2 }}>
            {roles.map((role) => {
              const capability = ROLE_CAPABILITIES[role] ?? { icon: Shield, summary: "Custom workspace role." };
              return (
                <CapabilityRow
                  key={role}
                  icon={capability.icon}
                  role={role}
                  count={roleCounts[role] ?? 0}
                  summary={capability.summary}
                />
              );
            })}
          </Box>
        </Box>

        {/* Invitations */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ mb: 1.5, minHeight: { md: 52 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Clock size={16} color={brandColors.primary} />
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Recent Invitations</Typography>
              {pendingInvites.length > 0 && (
                <Chip
                  label={`${pendingInvites.length} pending`}
                  size="small"
                  sx={{ height: 20, fontSize: 10, fontWeight: 800, letterSpacing: 0.3, bgcolor: "rgba(227,180,72,0.16)", color: brandColors.accentGold }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
              Track the status of pending and accepted team invites.
            </Typography>
          </Box>
          <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2 }}>
            {recentActivity.length === 0 ? (
              <Stack sx={{ alignItems: "center", textAlign: "center", py: 4 }} spacing={0.5}>
                <Mail size={20} color={brandColors.outline} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>No invitations yet</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Every invite you send shows up here with its status.
                </Typography>
              </Stack>
            ) : (
              recentActivity.map((member) => {
                const accepted = member.status === STATUS.ACTIVE;
                return (
                  <Stack
                    key={member.id}
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: "none" } }}
                  >
                    <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: brandColors.hover, color: brandColors.primary }}>
                      {accepted ? <Check size={16} /> : <Mail size={16} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                        {member.role} · {relativeTime(member.joinedAt) || member.joined}
                      </Typography>
                    </Box>
                    {!accepted && (
                      <Tooltip title="Copy invite link">
                        <IconButton size="small" onClick={() => handleCopyInviteLink(member)} sx={{ color: "text.secondary" }}>
                          <Link2 size={15} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Chip
                      label={accepted ? "ACCEPTED" : "PENDING"}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        ...(accepted
                          ? { bgcolor: "rgba(44,194,149,0.15)", color: brandColors.primary }
                          : { bgcolor: "rgba(227,180,72,0.16)", color: brandColors.accentGold }),
                      }}
                    />
                  </Stack>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Filter menu */}
      <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
        <Typography sx={{ px: 2, pt: 0.5, pb: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: "text.secondary" }}>
          ROLE
        </Typography>
        {[ANY, ...roles].map((role) => (
          <MenuItem
            key={`role-${role}`}
            selected={roleFilter === role}
            onClick={() => { setRoleFilter(role); setShowAll(false); setFilterAnchor(null); }}
            sx={{ fontSize: 13 }}
          >
            {role === ANY ? "All roles" : role}
          </MenuItem>
        ))}
        <Divider />
        <Typography sx={{ px: 2, pt: 0.5, pb: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: "text.secondary" }}>
          STATUS
        </Typography>
        {[ANY, STATUS.ACTIVE, STATUS.INVITED].map((status) => (
          <MenuItem
            key={`status-${status}`}
            selected={statusFilter === status}
            onClick={() => { setStatusFilter(status); setShowAll(false); setFilterAnchor(null); }}
            sx={{ fontSize: 13 }}
          >
            {status === ANY ? "All statuses" : status}
          </MenuItem>
        ))}
      </Menu>

      {/* Sort menu */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        {SORTS.map((sort) => (
          <MenuItem
            key={sort.key}
            selected={sortBy === sort.key}
            onClick={() => { setSortBy(sort.key); setSortAnchor(null); }}
            sx={{ fontSize: 13 }}
          >
            {sort.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Member menu */}
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={closeMenu}>
        {roles.map((role) => (
          <MenuItem
            key={role}
            selected={menu.member?.role === role}
            disabled={menu.member?.role === role}
            onClick={() => handleRoleChange(menu.member, role)}
            sx={{ fontSize: 13 }}
          >
            <ListItemIcon><Shield size={15} /></ListItemIcon>
            Make {role}
          </MenuItem>
        ))}
        <Divider />
        {menu.member?.status === STATUS.INVITED && (
          <MenuItem onClick={() => handleCopyInviteLink(menu.member)} sx={{ fontSize: 13 }}>
            <ListItemIcon><Link2 size={15} /></ListItemIcon>
            Copy invite link
          </MenuItem>
        )}
        <MenuItem
          onClick={() => { setPendingRemove(menu.member); closeMenu(); }}
          sx={{ fontSize: 13, color: "error.main" }}
        >
          <ListItemIcon><Trash2 size={15} color="currentColor" /></ListItemIcon>
          Remove from team
        </MenuItem>
      </Menu>

      {/* Invite dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => !inviting && setInviteOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="team-invite-title"
      >
        <DialogTitle id="team-invite-title" sx={{ fontWeight: 700 }}>Invite Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {inviteError && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>{inviteError}</Alert>
            )}

            {/* Explains a full workspace before the invite is attempted. The
                server refuses it either way. */}
            {seats?.reached && (
              <Alert
                severity="warning"
                sx={{ borderRadius: 2, fontSize: 13 }}
                action={
                  <Button component={Link} to="/dashboard/upgrade" size="small" sx={{ fontWeight: 700 }}>
                    Upgrade
                  </Button>
                }
              >
                {seats.limit === 1
                  ? "Your plan is single-user. Upgrade to invite teammates."
                  : `All ${seats.limit} seats on your plan are taken, including yours.`}
              </Alert>
            )}
            <TextField
              autoFocus
              required
              label="Email address"
              size="small"
              fullWidth
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
            <TextField
              label="Full name (optional)"
              size="small"
              fullWidth
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              helperText="Left blank, a name is derived from the email address."
            />
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: "text.secondary", mb: 0.75 }}>
                ROLE
              </Typography>
              <Button
                fullWidth
                onClick={(e) => setInviteRoleAnchor(e.currentTarget)}
                startIcon={<Shield size={15} />}
                sx={{
                  justifyContent: "flex-start",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  py: 0.85,
                  fontWeight: 600,
                }}
              >
                {inviteRole}
              </Button>
              <Menu
                anchorEl={inviteRoleAnchor}
                open={Boolean(inviteRoleAnchor)}
                onClose={() => setInviteRoleAnchor(null)}
                slotProps={{ paper: { sx: { width: 240 } } }}
              >
                {roles.map((role) => (
                  <MenuItem
                    key={role}
                    selected={inviteRole === role}
                    onClick={() => { setInviteRole(role); setInviteRoleAnchor(null); }}
                    sx={{ fontSize: 13 }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)} disabled={inviting} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviting}
            startIcon={inviting ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : null}
            sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            {inviting ? "Sending…" : "Send Invite"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Remove this member?"
        description={`${pendingRemove?.name ?? "This person"} loses access to the workspace. You can invite them again later.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onClose={() => setPendingRemove(null)}
      />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notice ? (
          <Alert
            role={notice.severity === "error" ? "alert" : "status"}
            severity={notice.severity}
            variant="filled"
            onClose={() => setNotice(null)}
            sx={{ borderRadius: 2 }}
          >
            {notice.message}
          </Alert>
        ) : null}
      </Snackbar>
    </Stack>
  );
}
