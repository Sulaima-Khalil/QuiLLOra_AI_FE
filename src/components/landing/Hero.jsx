import { Link } from "react-router-dom";
import { keyframes } from "@mui/system";
import { Box, Container, Typography, Button, Stack, Paper, Chip, Avatar } from "@mui/material";
import { ArrowRight, Play, Sparkles, BarChart3, Zap, Users } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const inspiration = ["AI in Education", "Sustainable Future", "No-code Revolution"];

const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
`;

// One floating badge on each side of the card (top / right / bottom / left).
const floatingBadges = [
  {
    icon: Sparkles,
    label: "AI Writing Assistant active",
    pos: { top: 0, left: "50%" },
    translate: "-50% -68%",
    dur: 6,
    delay: 0,
  },
  {
    icon: BarChart3,
    label: "Performance Analytics",
    pos: { top: "50%", right: 0 },
    translate: "52% -50%",
    dur: 7,
    delay: -1.5,
  },
  {
    icon: Users,
    label: "Real-time collaboration",
    pos: { bottom: 0, left: "50%" },
    translate: "-50% 68%",
    dur: 7.5,
    delay: -2.5,
  },
  {
    icon: Zap,
    label: "Instant AI drafts",
    pos: { top: "50%", left: 0 },
    translate: "-52% -50%",
    dur: 8,
    delay: -1,
  },
];

export default function Hero() {
  return (
    <Box sx={{ position: "relative", overflow: "hidden" }}>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: 576,
          height: 576,
          transform: "translateX(-33%)",
          borderRadius: "50%",
          bgcolor: "secondary.main",
          opacity: 0.07,
          filter: "blur(64px)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "33%",
          right: 0,
          width: 384,
          height: 384,
          borderRadius: "50%",
          bgcolor: "primary.main",
          opacity: 0.08,
          filter: "blur(64px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", py: { xs: 8, lg: 12 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 8,
            alignItems: "center",
          }}
        >
          <Box className="animate-slide-up">
            <Typography variant="h1" sx={{ fontSize: { xs: "2.75rem", sm: "3.5rem" }, lineHeight: 1.1 }}>
              Idea to Impact.
              <br />
              AI-Powered.
              <br />
              <Box component="span" sx={{ fontStyle: "italic", color: "secondary.main" }}>
                Human-Crafted.
              </Box>
            </Typography>

            <Typography variant="body1" sx={{ mt: 3, maxWidth: 420, fontSize: "1.125rem", color: "text.secondary" }}>
              InkFlow AI is the all-in-one platform to write, optimize, publish,
              and grow your ideas with the power of AI.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 4, flexWrap: "wrap" }} useFlexGap>
              <Button component={Link} to="/register" size="large" variant="contained" endIcon={<ArrowRight size={18} />}>
                Start Writing — It&rsquo;s Free
              </Button>
              <Button size="large" variant="outlined" startIcon={<Play size={18} />}>
                Watch Demo
              </Button>
            </Stack>
          </Box>

          <Box
            className="animate-fade-in"
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: { xs: 460, lg: 420 },
              mx: { xs: "auto", lg: 0 },
              ml: { lg: "auto" },
              mt: { xs: 5, lg: 0 },
              display: { xs: "flex", lg: "block" },
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 1.5, lg: 0 },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                width: "100%",
                p: 3,
                borderRadius: 2.5,
                backgroundImage: "none",
                background: "linear-gradient(155deg, rgba(45,212,191,0.13) 0%, rgba(15,158,140,0.04) 45%, rgba(13,19,32,0.28) 100%)",
                backdropFilter: "blur(24px) saturate(1.4)",
                border: "1px solid rgba(45,212,191,0.24)",
                boxShadow: "0 30px 70px -34px rgba(0,0,0,0.55), 0 0 50px -22px rgba(15,158,140,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <Typography variant="h6" sx={{ fontSize: "1.125rem" }}>
                What do you want to write today?
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mt: 2, borderRadius: 999, border: "1px solid rgba(45,212,191,0.25)", bgcolor: "rgba(45,212,191,0.08)", px: 2, py: 1.25 }}
              >
                <Typography variant="body2" noWrap sx={{ flex: 1, color: "text.secondary" }}>
                  e.g. "The future of AI in content marketing"
                </Typography>
                <Avatar
                  component={Link}
                  to="/register"
                  aria-label="Start writing"
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: "primary.main",
                    color: "#fff",
                    textDecoration: "none",
                    transition: "transform 0.18s ease, background 0.18s ease",
                    "&:hover": { bgcolor: brandColors.primaryDark, transform: "scale(1.06)" },
                  }}
                >
                  <ArrowRight size={18} />
                </Avatar>
              </Stack>

              <Typography variant="caption" sx={{ display: "block", mt: 2.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "text.disabled" }}>
                Try for inspiration
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap" }} useFlexGap>
                {inspiration.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      bgcolor: "rgba(45,212,191,0.06)",
                      border: "1px solid rgba(45,212,191,0.3)",
                      transition: "background 0.18s ease, border-color 0.18s ease",
                      "&:hover": { bgcolor: "rgba(45,212,191,0.14)", borderColor: "rgba(45,212,191,0.55)" },
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            {floatingBadges.map(({ icon: Icon, label, pos, translate, dur, delay }) => (
              <Paper
                key={label}
                elevation={0}
                sx={{
                  position: { xs: "static", lg: "absolute" },
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.85,
                  borderRadius: 2,
                  backgroundImage: "none",
                  background: "linear-gradient(135deg, rgba(45,212,191,0.14) 0%, rgba(13,19,32,0.45) 100%)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(45,212,191,0.28)",
                  boxShadow: "0 12px 30px -14px rgba(0,0,0,0.55), 0 0 24px -14px rgba(15,158,140,0.55)",
                  ...pos,
                  // Floating + off-card offset only on desktop; clean vertical stack on mobile.
                  "@media (min-width:1200px)": {
                    ...(translate ? { translate } : {}),
                    animation: `${floaty} ${dur}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  },
                  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", bgcolor: "rgba(44,194,149,0.15)", color: "secondary.main" }}>
                  <Icon size={12} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
