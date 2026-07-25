import { Link } from "react-router-dom";
import { Box, Container, Typography, Button, Stack, Avatar, AvatarGroup } from "@mui/material";
import { ArrowRight, Check } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const perks = ["No credit card required", "Free forever plan", "Cancel anytime"];

export default function FinalCTA() {
  return (
    <Box component="section" sx={{ position: "relative", overflow: "hidden" }}>
      {/* decorative glows on the page background (no card) */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 620,
          height: 480,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColors.primary}26 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -120,
          right: "12%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColors.secondary}1f 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", justifyContent: "center", mb: 2 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: brandColors.secondary }} />
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 2, color: brandColors.secondary }}>
            START TODAY
          </Typography>
        </Stack>

        <Typography
          variant="h2"
          sx={{ color: "text.primary", fontSize: { xs: "2.25rem", sm: "3rem", md: "3.5rem" }, lineHeight: 1.08 }}
        >
          Turn your next idea into{" "}
          <Box component="span" sx={{ fontStyle: "italic", color: brandColors.mint }}>
            published work.
          </Box>
        </Typography>

        <Typography variant="body1" sx={{ mt: 2.5, mx: "auto", maxWidth: 480, color: "text.secondary", lineHeight: 1.7 }}>
          Draft, refine, and publish with an intelligent editor built for serious
          writers and modern editorial teams.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4, justifyContent: "center" }} useFlexGap>
          <Button
            component={Link}
            to="/register"
            size="large"
            variant="contained"
            endIcon={<ArrowRight size={18} />}
            sx={{ bgcolor: brandColors.primary, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Start Writing — It&rsquo;s Free
          </Button>
          <Button
            component="a"
            href="#pricing"
            size="large"
            variant="outlined"
            sx={{ color: "text.primary", borderColor: "divider", "&:hover": { borderColor: brandColors.mint, bgcolor: brandColors.hover } }}
          >
            View Pricing
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ mt: 5, justifyContent: "center", alignItems: "center" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AvatarGroup
              max={4}
              sx={{ "& .MuiAvatar-root": { width: 30, height: 30, fontSize: 11, fontWeight: 700, border: "2px solid", borderColor: "background.default" } }}
            >
              <Avatar sx={{ bgcolor: brandColors.primary }}>AR</Avatar>
              <Avatar sx={{ bgcolor: brandColors.secondary, color: "#06231f" }}>SK</Avatar>
              <Avatar sx={{ bgcolor: brandColors.accentGold, color: brandColors.dark }}>MJ</Avatar>
              <Avatar sx={{ bgcolor: brandColors.bgSecondary, color: "text.secondary" }}>+</Avatar>
            </AvatarGroup>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Joining <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>12,000+</Box> writers
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: "wrap", justifyContent: "center", gap: 1.5 }}>
            {perks.map((p) => (
              <Stack key={p} direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
                <Check size={14} color={brandColors.mint} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>{p}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
