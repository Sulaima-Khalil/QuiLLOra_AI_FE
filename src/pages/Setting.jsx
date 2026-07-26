import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Switch,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Link,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Sparkles,
  ShieldCheck,
  HelpCircle,
  CreditCard,
  Bell,
  Users,
  MoreVertical,
  Shield,
  ArrowRight,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import {
  getProfile,
  saveProfile,
  saveSettings,
  getSettings,
  fetchProfile,
  deleteAccount,
  getInitials,
} from "../utils/profileStore";
import { logoutUser, listSessions } from "../utils/auth";
import { getTeam, getRoles, subscribeTeam, refreshTeam, inviteMember, updateMemberRole, removeMember as removeTeamMember } from "../utils/teamStore";
import { getSubscription, subscribeSubscription, fetchSubscription, planById, priceFor, formatDate } from "../utils/planStore";

const DEFAULT_SETTINGS = {
  tone: "Academic",
  creativeInference: true,
  autoCitations: false,
  twoFactor: false,
  editorialUpdates: true,
  analyticsReports: false,
};

const tones = ["Academic", "Minimalist", "Persuasive", "Technical"];

/** "Mozilla/5.0 (Macintosh…) Chrome/… Safari/…" -> "Chrome on macOS". */
const describeDevice = (userAgent = "") => {
  const browser =
    /Edg\//.test(userAgent) ? "Edge"
    : /OPR\//.test(userAgent) ? "Opera"
    : /Chrome\//.test(userAgent) ? "Chrome"
    : /Safari\//.test(userAgent) ? "Safari"
    : /Firefox\//.test(userAgent) ? "Firefox"
    : "Unknown browser";

  const platform =
    /Windows/.test(userAgent) ? "Windows"
    : /Macintosh|Mac OS/.test(userAgent) ? "macOS"
    : /iPhone|iPad/.test(userAgent) ? "iOS"
    : /Android/.test(userAgent) ? "Android"
    : /Linux/.test(userAgent) ? "Linux"
    : "";

  return platform ? `${browser} on ${platform}` : browser;
};

/** Coarse "how long ago" label — enough for a session list. */
const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";

  const units = [
    ["minute", 60],
    ["hour", 60],
    ["day", 24],
    ["month", 30],
  ];

  let amount = Math.floor(seconds / 60);
  let unit = "minute";

  for (let i = 0; i < units.length - 1 && amount >= units[i + 1][1]; i += 1) {
    amount = Math.floor(amount / units[i + 1][1]);
    unit = units[i + 1][0];
  }

  return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
};

const billingHistory = [
  { date: "Dec 15, 2024", amount: "$499.00" },
  { date: "Nov 15, 2024", amount: "$499.00" },
];

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
  p: 3,
};

const fieldLabelSx = { fontWeight: 600, color: "text.primary" };
const inputSx = {
  mt: 0.75,
  "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 14 },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: brandColors.primary },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: brandColors.secondary },
};

const linkSx = {
  fontWeight: 700,
  fontSize: 13,
  color: "primary.main",
  textDecoration: "none",
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
};

const SectionTitle = ({ icon: Icon, children, iconColor = brandColors.primary }) => (
  <Stack direction="row" spacing={1} sx={{
    alignItems: "center"
  }}>
    <Icon size={17} color={iconColor} />
    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
      {children}
    </Typography>
  </Stack>
);

const ToggleRow = ({ title, description, checked, onChange }) => (
  <Stack direction="row" sx={{
    alignItems: "center"
  }}>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {description}
      </Typography>
    </Box>
    <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} sx={switchSx} />
  </Stack>
);

export const Setting = () => {
  const navigate = useNavigate();
  const savedSettings = { ...DEFAULT_SETTINGS, ...getSettings() };
  const [profile, setProfile] = useState(getProfile());
  const [tone, setTone] = useState(savedSettings.tone);
  const [creativeInference, setCreativeInference] = useState(savedSettings.creativeInference);
  const [autoCitations, setAutoCitations] = useState(savedSettings.autoCitations);
  const [twoFactor, setTwoFactor] = useState(savedSettings.twoFactor);
  const [editorialUpdates, setEditorialUpdates] = useState(savedSettings.editorialUpdates);
  const [analyticsReports, setAnalyticsReports] = useState(savedSettings.analyticsReports);
  const [team, setTeam] = useState(getTeam);
  const [subscription, setSubscription] = useState(getSubscription);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [memberMenu, setMemberMenu] = useState({ anchor: null, member: null });
  const [saved, setSaved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeSubscription(setSubscription);
    fetchSubscription().catch(() => {});
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    listSessions()
      .then((rows) => {
        if (!cancelled) setSessions(rows);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      })
      .finally(() => {
        if (!cancelled) setSessionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribeTeam = subscribeTeam(setTeam);
    refreshTeam();

    // Load the server copy of the profile, then mirror the settings it
    // carries into the local form state.
    fetchProfile()
      .then((next) => {
        setProfile(next);
        const settings = { ...DEFAULT_SETTINGS, ...(next.settings ?? {}) };
        setTone(settings.tone);
        setCreativeInference(settings.creativeInference);
        setAutoCitations(settings.autoCitations);
        setTwoFactor(settings.twoFactor);
        setEditorialUpdates(settings.editorialUpdates);
        setAnalyticsReports(settings.analyticsReports);
      })
      .catch(() => {});

    return unsubscribeTeam;
  }, []);

  const handleProfile = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const closeMemberMenu = () => setMemberMenu({ anchor: null, member: null });

  const handleSaveChanges = async () => {
    try {
      await saveProfile({
        name: profile.name,
        email: profile.email,
        role: profile.role,
        bio: profile.bio,
        country: profile.country,
      });
      await saveSettings({
        tone,
        creativeInference,
        autoCitations,
        twoFactor,
        editorialUpdates,
        analyticsReports,
      });
      setSaved(true);
    } catch (error) {
      setSaveError(error?.response?.data?.message || "Could not save your changes.");
    }
  };

  const handleInviteSubmit = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await inviteMember(inviteName.trim(), inviteEmail.trim());
      setInviteName("");
      setInviteEmail("");
      setInviteOpen(false);
    } catch (error) {
      setSaveError(error?.response?.data?.message || "Could not send that invitation.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // The backend requires the password whenever the account has one, and
      // removes every article, collection and team record it owns.
      await deleteAccount(deletePassword);
      localStorage.removeItem("quillora_notifications_read");
      await logoutUser();
      navigate("/");
    } catch (error) {
      setSaveError(error?.response?.data?.message || "Could not delete your account.");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={1.5} sx={{
        alignItems: "center"
      }}>
        <Typography variant="h4" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}>
          Settings
        </Typography>
        <Chip
          icon={<Sparkles size={12} color={brandColors.primary} />}
          label="AI Sync Active"
          size="small"
          sx={{ bgcolor: "#DFF7EE", color: brandColors.primary, fontWeight: 700, fontSize: 11 }}
        />
        <Box sx={{ flex: 1 }} />
        {/* Was an unlabelled button with no handler — a focus stop that did
            nothing. Pointed at the help page the icon already implied. */}
        <IconButton
          size="small"
          component={RouterLink}
          to="/dashboard/help"
          aria-label="Help and support"
          sx={{ color: "text.secondary" }}
        >
          <HelpCircle size={18} aria-hidden="true" />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          onClick={handleSaveChanges}
          sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
        >
          Save Changes
        </Button>
      </Stack>
      {/* Profile information */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
          Profile Information
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.25, color: "text.secondary" }}>
          Update your personal details and editorial avatar.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ mt: 2.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={fieldLabelSx}>Full Name</Typography>
            <TextField fullWidth size="small" name="name" value={profile.name} onChange={handleProfile} sx={inputSx} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={fieldLabelSx}>Email Address</Typography>
            <TextField fullWidth size="small" type="email" name="email" value={profile.email} onChange={handleProfile} sx={inputSx} />
          </Box>
        </Stack>
      </Box>
      {/* Brand voice preferences */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <SectionTitle icon={Sparkles}>Brand Voice Preferences</SectionTitle>

        <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: brandColors.bgSecondary, borderLeft: `3px solid ${brandColors.primary}` }}>
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", lineHeight: 1.7 }}>
            &ldquo;Your current voice profile is set to{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>{tone} Authority</Box>. AI
            suggestions will prioritize empirical evidence and formal syntax.&rdquo;
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ mt: 2.5, display: "block", ...fieldLabelSx }}>
          Tone Selection
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
          {tones.map((t) => (
            <Button
              key={t}
              size="small"
              onClick={() => setTone(t)}
              sx={{
                px: 2,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 12,
                ...(tone === t
                  ? { bgcolor: brandColors.primary, color: "#fff", "&:hover": { bgcolor: brandColors.primaryDark } }
                  : { color: "text.secondary", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: brandColors.hover } }),
              }}
            >
              {t}
            </Button>
          ))}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <ToggleRow
            title="Creative Inference"
            description="Allow AI to extrapolate beyond provided source material."
            checked={creativeInference}
            onChange={setCreativeInference}
          />
          <ToggleRow
            title="Automatic Citations"
            description="Automatically format references in MLA/APA style."
            checked={autoCitations}
            onChange={setAutoCitations}
          />
        </Stack>
      </Box>
      {/* Account security */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <SectionTitle icon={ShieldCheck}>Account Security</SectionTitle>

        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
          <ToggleRow
            title="Two-Factor Authentication"
            description="Secure your account with a mobile authenticator app."
            checked={twoFactor}
            onChange={setTwoFactor}
          />

          <Divider />

          <Stack direction="row" sx={{
            alignItems: "center"
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                Password
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Last changed 4 months ago.
              </Typography>
            </Box>
            <Typography component="a" sx={linkSx}>Update</Typography>
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ mt: 3, display: "block", ...fieldLabelSx }}>
          Active Sessions
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {sessionsLoading && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Loading sessions…
            </Typography>
          )}

          {!sessionsLoading && sessions.length === 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              No other active sessions.
            </Typography>
          )}

          {sessions.map((s) => (
            <Stack
              key={s.id}
              direction="row"
              sx={{
                alignItems: "center",
                p: 1.5,
                borderRadius: 2,
                bgcolor: brandColors.bgSecondary
              }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: 13 }}>
                  {describeDevice(s.userAgent)}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {s.current ? "Current session" : `Signed in ${timeAgo(s.createdAt)}`}
                  {s.ipAddress ? ` • ${s.ipAddress}` : ""}
                </Typography>
              </Box>
              {s.current && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{ bgcolor: "#DFF7EE", color: brandColors.primary, fontWeight: 700, fontSize: 11 }}
                />
              )}
            </Stack>
          ))}
        </Stack>
      </Box>
      {/* Subscription management */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <Stack direction="row" sx={{
          alignItems: "center"
        }}>
          <Box sx={{ flex: 1 }}>
            <SectionTitle icon={CreditCard}>Subscription Management</SectionTitle>
          </Box>
          <Chip
            label={subscription.status === "cancelled" ? "Cancelled" : "Active"}
            size="small"
            sx={{ bgcolor: "#DFF7EE", color: brandColors.primary, fontWeight: 700, fontSize: 11 }}
          />
        </Stack>

        <Box
          sx={{
            mt: 2.5,
            p: 3,
            borderRadius: 2.5,
            bgcolor: brandColors.dark,
            color: "#fff",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: brandColors.mint }}>
              Current Plan
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, mt: 0.25 }}>
              {planById(subscription.planId).name}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.65)" }}>
              {/* Server fields: an active paid plan has a period end; a
                  requested one is still waiting on payment. */}
              {subscription.currentPeriodEnd
                ? `Next billing date: ${formatDate(subscription.currentPeriodEnd)}`
                : subscription.pendingPlanId
                  ? `${planById(subscription.pendingPlanId).name} requested — awaiting payment`
                  : "No paid subscription yet"}
            </Typography>
          </Box>
          <Stack spacing={1.25} sx={{
            alignItems: { xs: "flex-start", sm: "flex-end" }
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: 26, lineHeight: 1 }}>
              ${priceFor(planById(subscription.planId), subscription.cycle)}
              <Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                /mo
              </Box>
            </Typography>
            <Button
              size="small"
              variant="contained"
              component={RouterLink}
              to="/dashboard/upgrade"
              sx={{ bgcolor: "#fff", color: brandColors.dark, fontWeight: 700, "&:hover": { bgcolor: "#E6F2EE" } }}
            >
              {subscription.planId === "starter" ? "Upgrade Plan" : "Manage Billing"}
            </Button>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={fieldLabelSx}>Payment Method</Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                mt: 1,
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider"
              }}>
              <CreditCard size={18} color={brandColors.text} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: 13 }}>
                  Visa ending in 4242
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Expires 12/26
                </Typography>
              </Box>
              <Typography component="a" sx={linkSx}>Edit</Typography>
            </Stack>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={fieldLabelSx}>Billing History</Typography>
            <Stack sx={{ mt: 1 }} divider={<Divider />}>
              {billingHistory.map((row) => (
                <Stack
                  key={row.date}
                  direction="row"
                  sx={{
                    alignItems: "center",
                    py: 1
                  }}>
                  <Typography variant="body2" sx={{ flex: 1, color: "text.secondary", fontSize: 13 }}>
                    {row.date}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: 13, mr: 3 }}>
                    {row.amount}
                  </Typography>
                  <Typography component="a" sx={linkSx}>PDF</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
      {/* Notifications */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <SectionTitle icon={Bell}>Notifications</SectionTitle>

        <Stack spacing={2} sx={{ mt: 2.5 }}>
          <ToggleRow
            title="Editorial Updates"
            description="Get notified when a draft is reviewed or commented on."
            checked={editorialUpdates}
            onChange={setEditorialUpdates}
          />
          <ToggleRow
            title="Analytics Reports"
            description="Weekly summary of content performance and AI usage."
            checked={analyticsReports}
            onChange={setAnalyticsReports}
          />
        </Stack>
      </Box>
      {/* Team management */}
      <Box sx={{ ...cardSx, mt: 3 }}>
        <Stack direction="row" sx={{
          alignItems: "center"
        }}>
          <Box sx={{ flex: 1 }}>
            <SectionTitle icon={Users}>Team Management</SectionTitle>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => setInviteOpen(true)}
            sx={{ bgcolor: brandColors.primary, fontSize: 12, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Invite Member
          </Button>
        </Stack>

        <Stack spacing={1} sx={{ mt: 2.5 }}>
          {team.map((member) => (
            <Stack
              key={member.id}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                p: 1.5,
                borderRadius: 2,
                bgcolor: brandColors.bgSecondary
              }}>
              <Avatar sx={{ width: 34, height: 34, fontSize: 13, fontWeight: 700, bgcolor: brandColors.primary }}>
                {getInitials(member.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: 13 }}>
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {member.role}
                </Typography>
              </Box>
              <IconButton
                size="small"
                aria-label={`More actions for ${member.name}`}
                aria-haspopup="menu"
                sx={{ color: "text.secondary" }}
                onClick={(e) => setMemberMenu({ anchor: e.currentTarget, member })}
              >
                <MoreVertical size={16} aria-hidden="true" />
              </IconButton>
            </Stack>
          ))}
        </Stack>

        <Typography
          component={RouterLink}
          to="/dashboard/team"
          variant="body2"
          sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          View full team page <ArrowRight size={14} />
        </Typography>

        <Menu
          anchorEl={memberMenu.anchor}
          open={Boolean(memberMenu.anchor)}
          onClose={closeMemberMenu}
        >
          {getRoles().map((role) => (
            <MenuItem
              key={role}
              onClick={() => {
                updateMemberRole(memberMenu.member.id, role);
                closeMemberMenu();
              }}
              sx={{ fontSize: 13 }}
            >
              <ListItemIcon><Shield size={15} /></ListItemIcon>
              Make {role}
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              removeTeamMember(memberMenu.member.id);
              closeMemberMenu();
            }}
            sx={{ fontSize: 13, color: "error.main" }}
          >
            Remove member
          </MenuItem>
        </Menu>
      </Box>
      {/* Danger zone */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(239,83,80,0.35)",
          bgcolor: "rgba(239,83,80,0.08)",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main" }}>
          Danger Zone
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { sm: "center" },
            mt: 1
          }}>
          <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
            Permanently delete your QuiLLora AI account and all associated editorial data.
            This action cannot be undone.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setDeleteOpen(true)}
            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Delete Account
          </Button>
        </Stack>
      </Box>
      {/* Footer */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: "center",
          mt: 4,
          mb: 4
        }}>
        <Typography variant="caption" sx={{ flex: 1, color: "text.secondary" }}>
          © 2024 QuiLLora AI. Secure Editorial Environment.
        </Typography>
        <Stack direction="row" spacing={2.5}>
          {["Privacy Policy", "Terms of Service", "Security Guidelines"].map((label) => (
            <Link
              key={label}
              underline="hover"
              sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", cursor: "pointer" }}
            >
              {label}
            </Link>
          ))}
        </Stack>
      </Stack>
      {/* Invite member dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="settings-invite-title"
        aria-describedby="settings-invite-description"
      >
        <DialogTitle id="settings-invite-title" sx={{ fontWeight: 700 }}>Invite Team Member</DialogTitle>
        <DialogContent>
          <Typography id="settings-invite-description" variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Enter the email address of the person you'd like to invite as an Editor. An
            invitation will be sent to them.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            type="email"
            placeholder="name@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInviteSubmit()}
          />
          <TextField
            fullWidth
            size="small"
            placeholder="Full name (optional)"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInviteSubmit()}
            sx={{ mt: 1.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInviteSubmit}
            sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete account confirmation */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
      >
        <DialogTitle id="delete-account-title" sx={{ fontWeight: 700, color: "error.main" }}>Delete Account?</DialogTitle>
        <DialogContent>
          {/* Wired as the description so the consequences are read out with
              the dialog's name, not left for the user to discover. */}
          <Typography id="delete-account-description" variant="body2" sx={{ color: "text.secondary" }}>
            This permanently deletes your account along with every article, collection and team
            record it owns. This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="password"
            placeholder="Confirm your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert role="status" severity="success" variant="filled" onClose={() => setSaved(false)} sx={{ borderRadius: 2 }}>
          Settings saved successfully.
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(saveError)}
        autoHideDuration={5000}
        onClose={() => setSaveError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setSaveError("")} sx={{ borderRadius: 2 }}>
          {saveError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
