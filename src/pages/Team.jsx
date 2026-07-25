import { useEffect, useMemo, useState } from "react";
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
  Switch,
} from "@mui/material";
import {
  UserPlus,
  MoreVertical,
  Shield,
  Users,
  FileText,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  CheckSquare,
  UploadCloud,
  Mail,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { getInitials } from "../utils/profileStore";
import { getTeam, getRoles, inviteMember, updateMemberRole, removeMember, subscribeTeam } from "../utils/teamStore";

const roleChip = (role) =>
  role === "Admin"
    ? { bgcolor: brandColors.primary, color: "#fff" }
    : { bgcolor: brandColors.hover, color: brandColors.mint };

const hash = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};
const isActive = (m) => hash(m.id + m.name) % 3 !== 0;

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

const PermissionRow = ({ icon: Icon, label, control }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.25, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ display: "flex", color: brandColors.primary }}><Icon size={17} /></Box>
    <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "text.primary" }}>{label}</Typography>
    {control}
  </Stack>
);

const tealSwitchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: brandColors.secondary },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: brandColors.secondary },
};

export default function Team() {
  const [team, setTeam] = useState(getTeam);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [menu, setMenu] = useState({ anchor: null, member: null });
  const [perms, setPerms] = useState({ approval: true, external: false });
  const [invitations, setInvitations] = useState([
    { id: "i1", email: "tony.stark@stark.io", by: "Alex Thorne", when: "2 hours ago", status: "PENDING" },
    { id: "i2", email: "pepper.p@stark.io", by: "Alex Thorne", when: "1 day ago", status: "ACCEPTED" },
  ]);

  useEffect(() => subscribeTeam(setTeam), []);

  const closeMenu = () => setMenu({ anchor: null, member: null });

  const handleInvite = () => {
    if (!inviteName.trim()) return;
    inviteMember(inviteName, inviteEmail);
    const email = inviteEmail.trim() || `${inviteName.trim().toLowerCase().replace(/\s+/g, ".")}@quillora.ai`;
    setInvitations((prev) => [{ id: `i-${prev.length + 1}`, email, by: "You", when: "just now", status: "PENDING" }, ...prev]);
    setInviteName("");
    setInviteEmail("");
    setInviteOpen(false);
  };

  const roleSummary = useMemo(() => {
    const roles = getRoles();
    return roles
      .map((role) => ({ role, count: team.filter((m) => m.role === role).length }))
      .filter((r) => r.count > 0)
      .map((r) => `${r.count} ${r.role}${r.count > 1 ? "s" : ""}`)
      .join(", ");
  }, [team]);

  const visibleMembers = team.slice(0, 4);

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
        <Button
          variant="contained"
          startIcon={<UserPlus size={16} />}
          onClick={() => setInviteOpen(true)}
          sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark }, alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Invite Member
        </Button>
      </Stack>

      {/* Top cards */}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        <StatCard icon={Users} chip="Active Now" value={`${team.length} Members`} sub={roleSummary || "No members yet"} />
        <StatCard icon={FileText} value="84 Articles" sub="Published this month by the team" />
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
            sx={{ alignSelf: "flex-start", p: 0, color: brandColors.mint, fontWeight: 700, "&:hover": { bgcolor: "transparent", opacity: 0.85 } }}
          >
            Configure Permissions
          </Button>
        </Box>
      </Box>

      {/* Collaborators */}
      <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Collaborators</Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" sx={{ color: "text.secondary" }}><Filter size={16} /></IconButton>
            <IconButton size="small" sx={{ color: "text.secondary" }}><SlidersHorizontal size={16} /></IconButton>
          </Stack>
        </Stack>
        <Stack>
          {visibleMembers.map((member) => {
            const online = isActive(member);
            return (
              <Stack
                key={member.id}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: "none" } }}
              >
                <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: brandColors.primary }}>
                  {getInitials(member.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>{member.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{member.email}</Typography>
                </Box>
                <Chip label={member.role} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 700, ...roleChip(member.role) }} />
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", width: 68 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: online ? brandColors.secondary : brandColors.outline || "#B5C0BC" }} />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{online ? "Active" : "Offline"}</Typography>
                </Stack>
                <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, member })} sx={{ color: "text.secondary" }}>
                  <MoreVertical size={16} />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
        {team.length > 4 && (
          <Box sx={{ textAlign: "center", pt: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: brandColors.primary, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
              View all {team.length} members
            </Typography>
          </Box>
        )}
      </Box>

      {/* Permissions + Invitations */}
      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {/* Permissions */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ mb: 1.5, minHeight: { md: 52 } }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Team Permissions</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
              Granular control over what each role can perform in the workspace.
            </Typography>
          </Box>
          <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2 }}>
            <PermissionRow
              icon={ShieldCheck}
              label="Admin Access"
              control={<Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: brandColors.primary }}>FULL</Typography>}
            />
            <PermissionRow
              icon={CheckSquare}
              label="Content Approval"
              control={<Switch checked={perms.approval} onChange={(e) => setPerms((p) => ({ ...p, approval: e.target.checked }))} sx={tealSwitchSx} />}
            />
            <PermissionRow
              icon={UploadCloud}
              label="External Publishing"
              control={<Switch checked={perms.external} onChange={(e) => setPerms((p) => ({ ...p, external: e.target.checked }))} sx={tealSwitchSx} />}
            />
          </Box>
        </Box>

        {/* Invitations */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ mb: 1.5, minHeight: { md: 52 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Clock size={16} color={brandColors.primary} />
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>Recent Invitations</Typography>
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
              Track the status of pending and accepted team invites.
            </Typography>
          </Box>
          <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", px: 2 }}>
            {invitations.map((inv) => (
              <Stack
                key={inv.id}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-of-type": { borderBottom: "none" } }}
              >
                <Box sx={{ width: 34, height: 34, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: brandColors.hover, color: brandColors.primary }}>
                  <Mail size={16} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {inv.email}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>Sent by {inv.by} · {inv.when}</Typography>
                </Box>
                <Chip
                  label={inv.status}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    ...(inv.status === "ACCEPTED"
                      ? { bgcolor: "rgba(44,194,149,0.15)", color: brandColors.primary }
                      : { bgcolor: "#FDF0E3", color: "#B8752E" }),
                  }}
                />
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Role menu */}
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={closeMenu}>
        {getRoles().map((role) => (
          <MenuItem
            key={role}
            selected={menu.member?.role === role}
            onClick={() => { updateMemberRole(menu.member.id, role); closeMenu(); }}
            sx={{ fontSize: 13 }}
          >
            <ListItemIcon><Shield size={15} /></ListItemIcon>
            Make {role}
          </MenuItem>
        ))}
        <MenuItem onClick={() => { removeMember(menu.member.id); closeMenu(); }} sx={{ fontSize: 13, color: "error.main" }}>
          Remove from team
        </MenuItem>
      </Menu>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Invite Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField autoFocus label="Full name" size="small" fullWidth value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
            <TextField
              label="Email (optional)"
              size="small"
              fullWidth
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
