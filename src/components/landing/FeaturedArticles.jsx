import { Box, Container, Typography, Avatar } from "@mui/material";
import { Clock } from "lucide-react";
import ai1 from "@/assets/ai1.png";
import rain1 from "@/assets/rain1.png";
import design1 from "@/assets/design1.png";
import engineering from "@/assets/engineering.png";

const featured = {
  image: ai1,
  category: "AI & Technology",
  title: "How AI is Reshaping the Future of Digital Creation",
  author: "Olivia Rhye",
  date: "Mar 24, 2024",
  readTime: "8 min read",
};

const sideArticles = [
  {
    image: rain1,
    category: "Productivity",
    title: "10 Productivity Habits That Changed My Life",
    author: "Liam Johnson",
    readTime: "6 min read",
  },
  {
    image: design1,
    category: "Writing",
    title: "The Art of Writing That Captivates Readers",
    author: "Ava Martinez",
    readTime: "7 min read",
  },
  {
    image: engineering,
    category: "Growth",
    title: "Building a Personal Brand in the AI Era",
    author: "Noah Williams",
    readTime: "9 min read",
  },
];

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const avatarPalette = ["primary.main", "secondary.main", "warning.main"];

export default function FeaturedArticles() {
  return (
    <Box component="section" id="articles">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              Editor&rsquo;s Pick
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              Featured Articles
            </Typography>
          </Box>
          <Typography component="a" href="#articles" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
            View all articles →
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
          <Box
            component="a"
            href="#articles"
            sx={{
              position: "relative",
              display: "block",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              textDecoration: "none",
              "&:hover img": { transform: "scale(1.05)" },
            }}
          >
            <Box
              component="img"
              src={featured.image}
              alt={featured.title}
              sx={{ width: "100%", height: { xs: 288, sm: 384 }, objectFit: "cover", transition: "transform 0.5s" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(12,43,38,0.95) 0%, rgba(12,43,38,0.6) 40%, transparent 100%)",
              }}
            />
            <Box sx={{ position: "absolute", left: 20, top: 20, bgcolor: "background.paper", borderRadius: 999, px: 1.5, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                {featured.category}
              </Typography>
            </Box>
            <Box sx={{ position: "absolute", inset: "auto 0 0 0", p: 3, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>
              <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "1.875rem" } }}>
                {featured.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                By {featured.author} · {featured.date} · {featured.readTime}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {sideArticles.map((article, i) => (
              <Box
                key={article.title}
                component="a"
                href="#articles"
                sx={{
                  display: "flex",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  textDecoration: "none",
                  boxShadow: 1,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4 },
                }}
              >
                <Box
                  component="img"
                  src={article.image}
                  alt={article.title}
                  sx={{ width: 80, height: 80, flexShrink: 0, borderRadius: 2, objectFit: "cover" }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
                    {article.category}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      fontFamily: "var(--font-heading)",
                      lineHeight: 1.3,
                      color: "text.primary",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Box sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: 9, fontWeight: 700, bgcolor: avatarPalette[i % avatarPalette.length] }}>
                      {getInitials(article.author)}
                    </Avatar>
                    <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                      {article.author} · <Clock size={12} /> {article.readTime}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
