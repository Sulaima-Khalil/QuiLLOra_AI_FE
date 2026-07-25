import { useMemo, useState } from "react";
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
  Feather,
  TrendingUp,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import { getProfile, saveProfile, getInitials } from "../utils/profileStore";
import { getArticles } from "../utils/articlesStore";
import { articleMetrics, formatCount } from "../utils/metrics";

const DISTINCTIONS = [
  { label: "Fact-Checker Pro", icon: BadgeCheck },
  { label: "Neural Narrative Architect", icon: BrainCircuit },
  { label: "Early Adopter", icon: Zap },
];

const ACTIVITY = [
  { icon: Send, title: 'Published "The Future of Neural Prose"', time: "2 hours ago", accent: true },
  { icon: FileEdit, title: 'Edited "Ethics in AI" draft', time: "Yesterday" },
  { icon: Share2, title: "Shared to Editorial Board", time: "3 days ago" },
  { icon: Award, title: "Won Editor of the Month", time: "1 week ago" },
];

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

const CircleIconButton = ({ children }) => (
  <IconButton
    size="small"
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
  const [profile, setProfile] = useState(getProfile());
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(profile);

  const featured = useMemo(
    () =>
      getArticles()
        .filter((a) => a.status !== "Archived")
        .slice(0, 2)
        .map((a) => ({ ...a, metrics: articleMetrics(a) })),
    []
  );

  const articleCount = useMemo(() => getArticles().filter((a) => a.status !== "Archived").length, []);

  const STATS = [
    { label: "ARTICLES", value: String(articleCount) },
    { label: "TOTAL READS", value: "2.4M" },
    { label: "ENGAGEMENT", value: "88%" },
    { label: "RANK", value: "Top 1%", accent: true },
  ];

  const openEdit = () => {
    setDraft(profile);
    setEditOpen(true);
  };

  const handleSave = () => {
    const next = saveProfile(draft);
    setProfile(next);
    setEditOpen(false);
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
          <Feather size={220} />
        </Box>

        <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 20, right: 20 }}>
          <CircleIconButton><Mail size={15} /></CircleIconButton>
          <CircleIconButton><Link2 size={15} /></CircleIconButton>
          <CircleIconButton><Share2 size={15} /></CircleIconButton>
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
              Specializing in the intersection of high-frequency AI generation and investigative journalism. With over a decade of editorial experience, I leverage InkFlow's neural engines to architect narratives that resonate with human intuition while maintaining mathematical precision.
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
            <SectionHeading icon={CheckCircle2}>Editorial Distinctions</SectionHeading>
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
                  sx={{ p: 1.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
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
            <Stack spacing={2}>
              {ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
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
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 2 }}>Network</Typography>
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
            <Typography sx={{ fontSize: 12.5, fontStyle: "italic", color: "text.secondary", lineHeight: 1.6 }}>
              &ldquo;{profile.name.split(" ")[0]}&apos;s writing tone has shifted toward &lsquo;Pragmatic Optimism&rsquo; over the last 30 days, seeing a 12% increase in shareability.&rdquo;
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Typography sx={{ textAlign: "center", fontSize: 12, color: "text.secondary", pt: 1 }}>
        © 2026 InkFlow AI Editorial Ecosystem. All Rights Reserved.
      </Typography>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full Name" size="small" fullWidth value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <TextField label="Role" size="small" fullWidth value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
