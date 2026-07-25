import { Box, Container, Typography, Avatar, Chip } from "@mui/material";
import { BadgeCheck, Star, FileText } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";

const writers = [
  { name: "Olivia Rhye", handle: "@olivia", expertise: "AI & Tech", followers: "128K", articles: 214, rating: 4.9, verified: true },
  { name: "Liam Johnson", handle: "@liamj", expertise: "Productivity", followers: "98K", articles: 176, rating: 4.8, verified: false },
  { name: "Ava Martinez", handle: "@avam", expertise: "UX Research", followers: "87K", articles: 152, rating: 4.9, verified: true },
  { name: "Noah Williams", handle: "@noahw", expertise: "Marketing", followers: "76K", articles: 133, rating: 4.7, verified: false },
  { name: "Isabella Chen", handle: "@isabella", expertise: "Design", followers: "65K", articles: 121, rating: 4.8, verified: true },
];

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const palette = ["primary.main", "secondary.main", "warning.main"];

export default function Writers() {
  return (
    <Box component="section" id="writers" sx={{ bgcolor: brandColors.bgSecondary, opacity: 1 }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              Featured Authors
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              Trending Writers
            </Typography>
          </Box>
          <Typography component="a" href="#writers" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
            View all writers →
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }, gap: 2 }}>
          {writers.map((writer, i) => (
            <Box
              key={writer.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                textAlign: "center",
                px: 2,
                py: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: 1,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Avatar sx={{ width: 64, height: 64, fontSize: 18, fontWeight: 700, bgcolor: palette[i % palette.length] }}>
                {getInitials(writer.name)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, fontFamily: "var(--font-button)", fontWeight: 600 }}>
                  {writer.name}
                  {writer.verified && <BadgeCheck size={16} color={brandColors.primary} />}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {writer.handle}
                </Typography>
              </Box>

              <Chip label={writer.expertise} size="small" sx={{ bgcolor: brandColors.hover, color: "text.primary", fontSize: 11 }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, fontSize: 12, color: "text.secondary" }}>
                <Typography variant="caption">{writer.followers} Followers</Typography>
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FileText size={13} /> {writer.articles}
                </Typography>
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "warning.main" }}>
                  <Star size={13} fill={brandColors.accentGold} /> {writer.rating}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
