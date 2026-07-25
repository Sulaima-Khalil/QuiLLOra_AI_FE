import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  PenSquare,
  FilePlus,
  Sparkles,
  CalendarClock,
  UserPlus,
  MoreVertical,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import Analytics from "../components/dashboard/Analytics";
import ai2 from "@/assets/ai2.png";
import ai1 from "@/assets/ai1.png";
import rain1 from "@/assets/rain1.png";
import design1 from "@/assets/design1.png";

const quickActions = [
  { icon: FilePlus, label: "New Article", to: "/dashboard/write" },
  { icon: Sparkles, label: "AI Generate", to: "/dashboard/ai-writer" },
  { icon: CalendarClock, label: "Schedule Post", to: "#" },
  { icon: UserPlus, label: "Invite Team", to: "#" },
];

const recentArticles = [
  {
    image: ai1,
    title: "The Future of AI in Content Creation",
    meta: "2h ago · 6 min read",
    category: "AI & Tech",
    status: "Published",
    chip: { bgcolor: "#DFF7EE", color: brandColors.primary },
    views: "12.4K",
    likes: "512",
    seo: 92,
  },
  {
    image: rain1,
    title: "10 Productivity Habits That Changed My Life",
    meta: "5h ago · 5 min read",
    category: "Lifestyle",
    status: "Draft",
    chip: { bgcolor: "#EEF1F0", color: brandColors.text },
    views: "8.7K",
    likes: "342",
    seo: 76,
  },
  {
    image: design1,
    title: "Design Systems for Editorial Teams",
    meta: "1d ago · 8 min read",
    category: "Design",
    status: "Published",
    chip: { bgcolor: "#DFF7EE", color: brandColors.primary },
    views: "15.2K",
    likes: "689",
    seo: 88,
  },
];

const activity = [
  {
    initials: "AR",
    color: brandColors.primary,
    content: (
      <>
        <Box component="strong" sx={{ color: "text.primary" }}>Ali Raza</Box> commented on{" "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>The Future of AI</Box>
      </>
    ),
    time: "2m ago",
  },
  {
    initials: "SK",
    color: brandColors.secondary,
    content: (
      <>
        <Box component="strong" sx={{ color: "text.primary" }}>Sara Khan</Box> started following you
      </>
    ),
    time: "15m ago",
  },
  {
    icon: Trophy,
    color: brandColors.accentGold,
    content: (
      <>
        <Box component="strong" sx={{ color: "text.primary" }}>Milestone Reached: 100K Views</Box> on your profile
      </>
    ),
    time: "1h ago",
  },
];

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
};

const seoColor = (score) => (score >= 85 ? brandColors.primary : score >= 70 ? brandColors.accentGold : "#C25B4A");

export default function Dashboard() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2.5, alignItems: "start" }}>
      {/* Hero banner */}
      <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", display: "flex" }}>
        <Box
          component="img"
          src={ai2}
          alt=""
          aria-hidden
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(10,26,23,0.96) 0%, rgba(10,26,23,0.75) 60%, rgba(10,26,23,0.55) 100%)",
          }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            alignItems: { md: "center" },
            position: "relative",
            zIndex: 1,
            p: { xs: 3, sm: 4 },
            width: "100%"
          }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, color: brandColors.mint }}>
              GOOD MORNING, ALEX 👋
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontFamily: "'Inter', sans-serif", fontWeight: 800, color: "#fff", fontSize: { xs: "1.5rem", sm: "1.875rem" }, lineHeight: 1.25 }}>
              Let&rsquo;s create something worth reading today.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 420, color: "rgba(255,255,255,0.75)" }}>
              &ldquo;Words have power. Your words can inspire, teach, and change lives.&rdquo; — QuiLLora AI
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: "wrap", gap: 1 }}>
              <Button
                component={Link}
                to="/dashboard/write"
                variant="contained"
                startIcon={<PenSquare size={14} />}
                sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
              >
                Continue Writing
              </Button>
              <Button
                component={Link}
                to="/dashboard/analytics"
                sx={{
                  px: 2.5,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(4px)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                }}
              >
                View Analytics
              </Button>
            </Stack>
          </Box>

          {/* Daily goal */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              p: 2,
              borderRadius: 2.5,
              bgcolor: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
              alignSelf: { xs: "flex-start", md: "center" }
            }}>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={62}
                thickness={4}
                sx={{ color: "rgba(255,255,255,0.15)" }}
              />
              <CircularProgress
                variant="determinate"
                value={72}
                size={62}
                thickness={4}
                sx={{ position: "absolute", left: 0, color: brandColors.mint, "& .MuiCircularProgress-circle": { strokeLinecap: "round" } }}
              />
              <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#fff" }}>
                  72%
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.55)" }}>
                DAILY GOAL PROGRESS
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 800, color: "#fff" }}>
                1,245 / 1,750 <Box component="span" sx={{ fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>words</Box>
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
      {/* Quick actions */}
      <Box sx={{ ...cardSx, p: 2.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: "text.secondary" }}>
          QUICK ACTIONS
        </Typography>
        <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
          {quickActions.map(({ icon: Icon, label, to }) => (
            <Box
              key={label}
              component={Link}
              to={to}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.75,
                py: 1.75,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: brandColors.bgSecondary,
                textDecoration: "none",
                transition: "all 0.2s",
                "&:hover": { borderColor: "primary.main", bgcolor: brandColors.hover },
              }}
            >
              <Icon size={18} color={brandColors.primary} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", textAlign: "center" }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Analytics — varied visualizations for visual rhythm */}
      <Analytics />
      {/* Recent articles */}
      <Box sx={{ ...cardSx, p: 3, overflowX: "auto" }}>
        <Stack
          direction="row"
          gap={1}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
              Recent Articles
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Managing your latest content and performance
            </Typography>
          </Box>
          <Typography
            component={Link}
            to="/dashboard/my-article"
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            View all articles <ArrowRight size={14} />
          </Typography>
        </Stack>

        <Box sx={{ minWidth: 620 }}>
          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gridTemplateColumns: "3fr 1fr 1fr 0.8fr 0.7fr 0.6fr 40px",
              gap: 1.5,
              pb: 1.25,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            {["ARTICLE", "CATEGORY", "STATUS", "VIEWS", "LIKES", "SEO", ""].map((h, i) => (
              <Typography key={i} variant="caption" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "text.secondary" }}>
                {h}
              </Typography>
            ))}
          </Box>

          {recentArticles.map(({ image, title, meta, category, status, chip, views, likes, seo }, i) => (
            <Box
              key={title}
              sx={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 0.8fr 0.7fr 0.6fr 40px",
                gap: 1.5,
                alignItems: "center",
                py: 1.75,
                borderBottom: i < recentArticles.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  alignItems: "center",
                  minWidth: 0
                }}>
                <Box
                  component="img"
                  src={image}
                  alt={title}
                  sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: 1.5, objectFit: "cover" }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.35 }}>
                    {title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {meta}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {category}
              </Typography>
              <Box>
                <Chip label={status} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, ...chip }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {views}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {likes}
              </Typography>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: `2px solid ${seoColor(seo)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 800, color: seoColor(seo) }}>
                  {seo}
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertical size={15} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Recent activity */}
      <Box sx={{ ...cardSx, p: 3 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Recent Activity
          </Typography>
          <Typography
            component="a"
            href="#"
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: 0.5, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            VIEW ALL
          </Typography>
        </Stack>

        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
          {activity.map(({ initials, icon: Icon, color, content, time }, i) => (
            <Stack key={i} direction="row" spacing={1.5}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: `${color}22`, color, fontSize: 12, fontWeight: 700 }}>
                {Icon ? <Icon size={15} /> : initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                  {content}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.75 }}>
                  {time}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
