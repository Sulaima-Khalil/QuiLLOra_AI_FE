import { Box, Container, Typography } from "@mui/material";
import { Sparkles, Search, PenSquare, Users } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const features = [
  { icon: Sparkles, title: "AI Writing Assistant", description: "Generate high-quality drafts, ideas, and outlines in seconds with unmatched understanding." },
  { icon: Search, title: "SEO Optimization", description: "Optimize your content for search engines with AI-powered keyword and structure suggestions." },
  { icon: PenSquare, title: "Smart Editor", description: "Enhance clarity, tone, and readability with real-time AI feedback and style adjustments." },
  { icon: Users, title: "Audience Insights", description: "Understand your readers and create content that resonates using deep analytical data." },
];

export default function Features() {
  return (
    <Box component="section" id="features" sx={{ bgcolor: brandColors.dark }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, lg: 10 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1.2fr" },
            gap: { xs: 5, lg: 8 },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "secondary.main" }}>
              Powered by AI
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" }, color: "#fff" }}>
              Smart Features For Modern Writers
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, maxWidth: 380, color: "rgba(255,255,255,0.65)" }}>
              Elevate your writing process with intelligent tools designed to
              streamline every step from ideation to publication.
            </Typography>
            <Typography
              component="a"
              href="#features"
              variant="body2"
              sx={{ mt: 2.5, display: "inline-block", fontWeight: 600, color: "secondary.main", "&:hover": { textDecoration: "underline" } }}
            >
              Explore all features →
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            {features.map(({ icon: Icon, title, description }) => (
              <Box
                key={title}
                className="group"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `1px solid ${brandColors.darkBorder}`,
                  bgcolor: brandColors.darkCard,
                  transition: "all 0.3s",
                  "&:hover": { transform: "translateY(-4px)", borderColor: "secondary.main" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "rgba(44,194,149,0.12)",
                    color: "secondary.main",
                    transition: "background-color 0.3s, color 0.3s",
                    ".group:hover &": { bgcolor: "secondary.main", color: brandColors.dark },
                  }}
                >
                  <Icon size={22} />
                </Box>
                <Typography variant="h6" sx={{ mt: 2, fontSize: "1.05rem", color: "#fff" }}>
                  {title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                  {description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
