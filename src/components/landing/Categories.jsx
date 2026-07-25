import { Box, Container, Typography } from "@mui/material";
import {
  Cpu,
  Briefcase,
  Rocket,
  PenTool,
  Megaphone,
  Building2,
  HeartPulse,
  Sparkle,
} from "lucide-react";

const tealTint = "rgba(14,111,92,0.08)";
const mintTint = "rgba(44,194,149,0.12)";

const categories = [
  { icon: Cpu, name: "AI & Tech", count: "12K articles", color: "primary.main", tint: tealTint },
  { icon: Briefcase, name: "Business", count: "18K articles", color: "secondary.main", tint: mintTint },
  { icon: Rocket, name: "Productivity", count: "9K articles", color: "primary.main", tint: tealTint },
  { icon: PenTool, name: "Design", count: "7K articles", color: "secondary.main", tint: mintTint },
  { icon: Megaphone, name: "Marketing", count: "11K articles", color: "primary.main", tint: tealTint },
  { icon: Building2, name: "Startups", count: "8K articles", color: "secondary.main", tint: mintTint },
  { icon: HeartPulse, name: "Health", count: "6K articles", color: "primary.main", tint: tealTint },
  { icon: Sparkle, name: "Lifestyle", count: "10K articles", color: "secondary.main", tint: mintTint },
];

export default function Categories() {
  return (
    <Box component="section" id="categories">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              Explore by Interest
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              Popular Categories
            </Typography>
          </Box>
          <Typography component="a" href="#categories" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
            Browse all →
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
          {categories.map(({ icon: Icon, name, count, color, tint }) => (
            <Box
              key={name}
              component="a"
              href="#categories"
              className="group"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                textAlign: "center",
                px: 2,
                py: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                textDecoration: "none",
                boxShadow: 1,
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-4px)", borderColor: "primary.main", boxShadow: 4 },
                "&:hover .cat-icon": { transform: "scale(1.1)" },
              }}
            >
              <Box
                className="cat-icon"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: tint,
                  color,
                  transition: "transform 0.3s",
                }}
              >
                <Icon size={20} />
              </Box>
              <Typography variant="body2" sx={{ fontFamily: "var(--font-button)", fontWeight: 600, color: "text.primary" }}>
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
