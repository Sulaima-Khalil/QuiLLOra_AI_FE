import { Box, Container, Typography, Avatar } from "@mui/material";
import { Lightbulb, Bot, Edit3, TrendingUp, Send, BarChart3 } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const steps = [
  { icon: Lightbulb, title: "Idea", description: "Capture your idea in seconds" },
  { icon: Bot, title: "AI Writing", description: "Let AI craft your content" },
  { icon: Edit3, title: "Editing", description: "Refine with smart suggestions" },
  { icon: TrendingUp, title: "SEO Optimization", description: "Rank higher with SEO tools" },
  { icon: Send, title: "Publish", description: "Share with the world instantly" },
  { icon: BarChart3, title: "Analytics", description: "Track performance and grow" },
];

export default function HowItWorks() {
  return (
    <Box component="section">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
            How It Works
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
            From Idea to Impact in 6 Simple Steps
          </Typography>
        </Box>

        <Box sx={{ position: "relative", mt: 7 }}>
          <Box
            aria-hidden
            sx={{
              display: { xs: "none", lg: "block" },
              position: "absolute",
              top: 24,
              left: "8%",
              right: "8%",
              borderTop: `2px dashed ${brandColors.border}`,
            }}
          />
          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(6, 1fr)" },
              gap: { xs: 4, lg: 2 },
            }}
          >
            {steps.map(({ icon: Icon, title, description }, i) => (
              <Box key={title} sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "background.paper",
                    color: "primary.main",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: 1,
                  }}
                >
                  <Icon size={20} />
                </Avatar>
                <Typography variant="caption" sx={{ mt: 1.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "secondary.main" }}>
                  Step {i + 1}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25, fontFamily: "var(--font-button)", fontWeight: 700, color: "text.primary" }}>
                  {title}
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, maxWidth: 140, color: "text.secondary" }}>
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
