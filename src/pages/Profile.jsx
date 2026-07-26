import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Pencil,
  Mail,
  Link2,
  Share2,
  BadgeCheck,
  BrainCircuit,
  Zap,
  CheckCircle2,
  Eye,
  Heart,
  Bookmark,
  Globe,
  Linkedin,
  Twitter,
  ExternalLink,
  FileEdit,
  Send,
  Award,
  TrendingUp,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import QuilloraMark from "../components/brand/QuilloraMark";
import { getProfile, saveProfile, getInitials, subscribeProfile, fetchProfile } from "../utils/profileStore";
import { getArticles, refreshArticles, subscribeArticles } from "../utils/articlesStore";
import { articleMetrics, formatCount, formatViews } from "../utils/metrics";
import { getSummary, refreshSummary, subscribeSummary } from "../utils/analyticsStore";

/*
 * Placeholder badges. There is no achievements API — nothing awards, stores or
 * revokes these — so they are labelled in the UI rather than presented as
 * something this author earned.
 */
const DISTINCTIONS = [
  { label: "Fact-Checker Pro", icon: BadgeCheck },
  { label: "Neural Narrative Architect", icon: BrainCircuit },
  { label: "Early Adopter", icon: Zap },
];

/** Icon per article state, for the activity list built from real articles. */
const ACTIVITY_ICON = { Published: Send, Draft: FileEdit, Archived: Share2 };

const NETWORK = [
  { label: "Personal Portfolio", icon: Globe },
  { label: "LinkedIn Professional", icon: Linkedin },
  { label: "X / Twitter", icon: Twitter },
];

const SectionHeading = ({ icon: Icon, children, action }) => (
  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      {Icon && <Icon size={18} color={brandColors.primary} />}
      <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>{children}</Typography>
    </Stack>
    {action}
  </Stack>
);

const CircleIconButton = ({ label, children }) => (
  <IconButton
    size="small"
    aria-label={label}
    sx={{
      width: 36,
      height: 36,
      color: "#fff",
      bgcolor: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.14)",
      "&:hover": { bgcolor: brandColors.primary, borderColor: brandColors.primary },
    }}
  >
    {children}
  </IconButton>
);

export const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile);
  const [articles, setArticles] = useState(getArticles);
  const [summary, setSummary] = useState(getSummary);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  /*
   * The page used to read each store once with `useState(getProfile())` and
   * `useMemo(..., [])`, so it showed whatever happened to be cached when it
   * mounted: a name changed in Settings stayed stale here, and a hard refresh
   * rendered an empty profile because nothing re-read the store once the
   * request landed.
   *
   * Subscribing is the pattern the stores already provide; the refresh calls
   * cover the cold-cache case. No profile state is duplicated — the store
   * stays the single source and this is a mirror of it.
   */
  useEffect(() => {
    const unsubscribers = [
      subscribeProfile(setProfile),
      subscribeArticles(setArticles),
      subscribeSummary(setSummary),
    ];

    fetchProfile().catch(() => {});
    refreshArticles().catch(() => {});
    refreshSummary();

    return () => unsubscribers.forEach((off) => off());
  }, []);

  const featured = useMemo(
    () =>
      articles
        .filter((a) => a.status !== "Archived")
        .slice(0, 2)
        .map((a) => ({ ...a, metrics: articleMetrics(a) })),
    [articles],
  );

  /** Recent activity, derived from the author's own articles. */
  const activity = useMemo(
    () =>
      [...articles]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
        .slice(0, 4)
        .map((a) => ({
          id: a.id,
          icon: ACTIVITY_ICON[a.status] ?? FileEdit,
          title: `${a.status === "Published" ? "Published" : a.status === "Archived" ? "Archived" : "Drafted"} “${a.title}”`,
          time: a.date,
          accent: a.status === "Published",
        })),
    [articles],
  );

  /*
   * Every figure here now comes from `GET /analytics/summary`. It previously
   * read TOTAL READS 2.4M, ENGAGEMENT 88% and RANK Top 1% — none of which the
   * backend computes, on an account that may have published nothing.
   */
  const STATS = [
    { label: "ARTICLES", value: summary ? String(summary.totalArticles) : "—" },
    { label: "PUBLISHED", value: summary ? String(summary.published) : "—" },
    { label: "TOTAL READS", value: summary ? formatViews(summary.totalViews) : "—", accent: true },
    { label: "TOTAL WORDS", value: summary ? formatCount(summary.totalWords) : "—" },
  ];

  const openEdit = () => {
    setDraft(profile);
    setSaveError("");
    setEditOpen(true);
  };

  /** `saveProfile` is async; the old code put its Promise straight into state. */
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      await saveProfile(draft);
      // The store notifies subscribers, so nothing is set from here.
      setEditOpen(false);
    } catch (error) {
      setSaveError(error?.response?.data?.message || "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Banner */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          background: `linear-gradient(135deg, #16233b 0%, ${brandColors.dark} 60%, #0a2b28 100%)`,
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2.5, sm: 4 },
          pt: { xs: 3, sm: 5 },
        }}
      >
        {/* faint watermark */}
        <Box sx={{ position: "absolute", right: -20, top: -20, color: "rgba(45,212,191,0.05)" }}>
          <QuilloraMark size={220} tone="mono" />
        </Box>

        <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 20, right: 20 }}>
          <CircleIconButton label="Email"><Mail size={15} aria-hidden="true" /></CircleIconButton>
          <CircleIconButton label="Copy profile link"><Link2 size={15} aria-hidden="true" /></CircleIconButton>
          <CircleIconButton label="Share profile"><Share2 size={15} aria-hidden="true" /></CircleIconButton>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, position: "relative" }}>
          <Avatar
            src={profile.avatar}
            sx={{
              width: { xs: 84, sm: 104 },
              height: { xs: 84, sm: 104 },
              fontSize: { xs: 28, sm: 34 },
              fontWeight: 700,
              bgcolor: brandColors.primary,
              color: "#fff",
              border: "3px solid rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          >
            {getInitials(profile.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: brandColors.mint, textTransform: "uppercase" }}>
              {profile.role || "Lead Editor"}
            </Typography>
            <Typography sx={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: { xs: "2rem", sm: "2.6rem" }, lineHeight: 1.05, color: "#fff", mt: 0.5 }}>
              {profile.name}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", fontStyle: "italic", mt: 0.5 }}>
              Deep-sea ink enthusiast & neural AI specialist.
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", mt: 1.5, maxWidth: 620, lineHeight: 1.65 }}>
              Specializing in the intersection of high-frequency AI generation and investigative journalism. With over a decade of editorial experience, I leverage QuiLLora's neural engines to architect narratives that resonate with human intuition while maintaining mathematical precision.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Pencil size={14} />}
              onClick={openEdit}
              sx={{ mt: 2, color: "#fff", borderColor: "rgba(255,255,255,0.25)", "&:hover": { borderColor: brandColors.mint, bgcolor: "rgba(255,255,255,0.06)" } }}
            >
              Edit Profile
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {STATS.map((s, i) => (
          <Box
            key={s.label}
            sx={{
              p: { xs: 2, sm: 2.5 },
              textAlign: "center",
              borderRight: { sm: i < STATS.length - 1 ? "1px solid" : "none" },
              borderBottom: { xs: i < 2 ? "1px solid" : "none", sm: "none" },
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: "text.secondary", textTransform: "uppercase" }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: { xs: 22, sm: 26 }, fontWeight: 800, mt: 0.5, color: s.accent ? brandColors.primary : "text.primary" }}>
              {s.value}
            </Typography>
            <Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: brandColors.primary, mx: "auto", mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Two columns */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1.9fr 1fr" }, alignItems: "start" }}>
        {/* Left */}
        <Stack spacing={3}>
          {/* Distinctions */}
          <Box>
            <SectionHeading
              icon={CheckCircle2}
              action={
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "text.secondary", textTransform: "uppercase" }}>
                  Sample badges
                </Typography>
              }
            >
              Editorial Distinctions
            </SectionHeading>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              {DISTINCTIONS.map(({ label, icon: Icon }) => (
                <Chip
                  key={label}
                  icon={<Icon size={14} />}
                  label={label}
                  sx={{
                    fontWeight: 700,
                    fontSize: 12.5,
                    bgcolor: brandColors.hover,
                    color: brandColors.mint,
                    border: "1px solid rgba(45,212,191,0.25)",
                    "& .MuiChip-icon": { color: brandColors.mint },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Featured work */}
          <Box>
            <SectionHeading
              action={
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: brandColors.primary, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                  View Library
                </Typography>
              }
            >
              Featured Work
            </SectionHeading>
            <Stack spacing={2}>
              {featured.map((a) => (
                <Stack
                  key={a.id}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  // Published work opens its public page; a draft has none yet.
                  onClick={() =>
                    navigate(a.status === "Published" ? `/article/${a.id}` : `/dashboard/write?edit=${a.id}`)
                  }
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    "&:hover": { borderColor: brandColors.primary },
                  }}
                >
                  <Box
                    component="img"
                    src={a.img}
                    alt=""
                    sx={{ width: { xs: "100%", sm: 150 }, height: { xs: 150, sm: 118 }, borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Chip label={a.category} size="small" sx={{ height: 20, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, bgcolor: brandColors.hover, color: brandColors.mint, textTransform: "uppercase" }} />
                      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{a.readingTime}</Typography>
                    </Stack>
                    <Typography sx={{ mt: 1, fontSize: 16, fontWeight: 800, color: "text.primary", lineHeight: 1.25 }}>
                      {a.title}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {a.description}
                    </Typography>
                    <Stack direction="row" spacing={2.5} sx={{ mt: 1.25, color: "text.secondary" }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <Eye size={13} /><Typography sx={{ fontSize: 11.5 }}>{formatCount(a.metrics.views || 4000)}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <Heart size={13} /><Typography sx={{ fontSize: 11.5 }}>{formatCount(Math.round((a.metrics.views || 4000) / 35))}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <Bookmark size={13} /><Typography sx={{ fontSize: 11.5 }}>{formatCount(Math.round((a.metrics.views || 4000) / 500))}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>

        {/* Right */}
        <Stack spacing={2.5}>
          {/* Recent activity */}
          <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", mb: 2 }}>Recent Activity</Typography>
            {/* Built from the author's own articles, not a fixed script of
                invented events ("Won Editor of the Month"). */}
            {activity.length === 0 ? (
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                No activity yet — your articles will show up here.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {activity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                      <Box sx={{ mt: 0.25, color: item.accent ? brandColors.primary : "text.secondary" }}>
                        <Icon size={15} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary", lineHeight: 1.35 }}>{item.title}</Typography>
                        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{item.time}</Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Network (dark) */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid rgba(45,212,191,0.2)",
              background: `linear-gradient(135deg, #16233b 0%, ${brandColors.dark} 100%)`,
            }}
          >
            {/* Placeholder rows: the profile model stores no social links, so
                these lead nowhere and are labelled rather than left to look
                like the author's actual accounts. */}
            <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", mb: 2 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Network</Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                Not linked yet
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {NETWORK.map(({ label, icon: Icon }) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    px: 1.5,
                    py: 1.1,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    "&:hover": { bgcolor: "rgba(45,212,191,0.12)", borderColor: "rgba(45,212,191,0.3)" },
                  }}
                >
                  <Icon size={15} color={brandColors.mint} />
                  <Typography sx={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{label}</Typography>
                  <ExternalLink size={13} color="rgba(255,255,255,0.5)" />
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Writer insights */}
          <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid rgba(45,212,191,0.25)", bgcolor: "rgba(45,212,191,0.06)" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <TrendingUp size={15} color={brandColors.primary} />
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: brandColors.mint }}>Writer Insights</Typography>
            </Stack>
            {/*
              This claimed the author's "tone has shifted toward Pragmatic
              Optimism… a 12% increase in shareability". Nothing measures tone
              or shareability; /ai/insights analyses one submitted article, not
              a writer over time. Replaced with arithmetic over real totals.
            */}
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.6 }}>
              {!summary ? (
                "Gathering your writing stats…"
              ) : summary.totalArticles === 0 ? (
                "Publish your first article to start building a picture of your writing."
              ) : (
                <>
                  {summary.published} of {summary.totalArticles} articles published, averaging{" "}
                  {formatCount(Math.round(summary.totalWords / Math.max(summary.totalArticles, 1)))} words each
                  {summary.totalReadTime > 0 && <> · {summary.totalReadTime} min of reading published</>}.
                </>
              )}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Typography sx={{ textAlign: "center", fontSize: 12, color: "text.secondary", pt: 1 }}>
        © 2026 QuiLLora AI Editorial Ecosystem. All Rights Reserved.
      </Typography>

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="edit-profile-title"
      >
        <DialogTitle id="edit-profile-title" sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              autoComplete="name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <TextField
              label="Role"
              size="small"
              fullWidth
              autoComplete="organization-title"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            />
            {/* A red sentence is invisible to a screen reader and to anyone
                who cannot separate the red from the surrounding grey. */}
            {saveError && (
              <Typography role="alert" sx={{ fontSize: 12.5, color: "error.main" }}>
                {saveError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={saving} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
