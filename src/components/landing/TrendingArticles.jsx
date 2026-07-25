import { Box, Container, Typography, Avatar } from "@mui/material";
import { Clock, Flame } from "lucide-react";
import ai2 from "@/assets/ai2.png";
import design2 from "@/assets/design2.png";
import rain3 from "@/assets/rain3.png";
import rain4 from "@/assets/rain4.png";
import rain1 from "@/assets/rain1.png";
import engineering from "@/assets/engineering.png";

const articles = [
  { image: ai2, category: "AI", title: "AI Agents: The Next Evolution Beyond Chatbots", author: "Sarah Miles", readTime: "6 min read" },
  { image: design2, category: "UX Research", title: "Why UX Research Is the Foundation of Great Digital Products", author: "Olivia Reed", readTime: "6 min read" },
  { image: rain3, category: "Design", title: "Color Psychology: How Colors Influence Digital Behavior", author: "Michael Ross", readTime: "4 min read" },
  { image: rain4, category: "Design", title: "The Cognitive Biases That Impact User Decisions", author: "Sophia Young", readTime: "5 min read" },
  { image: rain1, category: "Design", title: "Why Minimalism Still Dominates Digital Aesthetics", author: "David Lane", readTime: "4 min read" },
  { image: engineering, category: "Engineering", title: "Breaking Down Distributed Systems for Beginners", author: "Chris Nolan", readTime: "7 min read" },
];

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const avatarPalette = ["primary.main", "secondary.main", "warning.main"];

export default function TrendingArticles() {
  return (
    <Box component="section" id="trending">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}
            >
              <Flame size={14} /> Trending Now
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              What Readers Are Loving
            </Typography>
          </Box>
          <Typography component="a" href="#trending" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
            View all trending →
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 3 }}>
          {articles.map((article, i) => (
            <Box
              key={article.title}
              component="a"
              href="#trending"
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                textDecoration: "none",
                boxShadow: 1,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                "&:hover img": { transform: "scale(1.05)" },
              }}
            >
              <Box sx={{ position: "relative", overflow: "hidden" }}>
                <Box
                  component="img"
                  src={article.image}
                  alt={article.title}
                  sx={{ width: "100%", height: 176, objectFit: "cover", transition: "transform 0.5s" }}
                />
                <Box sx={{ position: "absolute", left: 12, top: 12, bgcolor: "background.paper", borderRadius: 999, px: 1.5, py: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {article.category}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2.5, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.125rem",
                    lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {article.title}
                </Typography>
                <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1, borderTop: "1px solid", borderColor: "divider", pt: 1.5 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 10, fontWeight: 700, bgcolor: avatarPalette[i % avatarPalette.length] }}>
                    {getInitials(article.author)}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {article.author}
                  </Typography>
                  <Typography variant="caption" sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                    <Clock size={12} /> {article.readTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
