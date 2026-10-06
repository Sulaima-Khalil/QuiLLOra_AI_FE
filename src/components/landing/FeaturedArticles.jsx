import { Box, Container, Typography } from "@mui/material";
import { ArrowRight, Clock } from "lucide-react";

const featured = {
  category: "AI & Technology",
  title: "How AI is Reshaping the Future of Digital Creation",
  description: "A closer look at how thoughtful AI tools are changing the way people shape ideas into original work.",
  author: "Olivia Rhye",
  readTime: "8 min read",
};

const sideArticles = [
  {
    category: "Productivity",
    title: "10 Productivity Habits That Changed My Life",
    author: "Liam Johnson",
    readTime: "6 min read",
  },
  {
    category: "Writing",
    title: "The Art of Writing That Captivates Readers",
    author: "Ava Martinez",
    readTime: "7 min read",
  },
  {
    category: "Growth",
    title: "Building a Personal Brand in the AI Era",
    author: "Noah Williams",
    readTime: "9 min read",
  },
];

export default function FeaturedArticles() {
  return (
    <Box component="section" id="articles" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              From the journal
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              Ideas worth exploring
            </Typography>
          </Box>
          <Typography component="a" href="#articles" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
            View all articles →
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" }, gap: { xs: 3, lg: 5 } }}>
          <Box
            component="a"
            href="#articles"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: { sm: 340 },
              p: { xs: 2.5, sm: 4 },
              borderRadius: 2,
              border: "1px solid rgba(45,212,191,0.25)",
              background: "linear-gradient(135deg, rgba(45,212,191,0.11), rgba(16,26,44,0.94) 58%)",
              textDecoration: "none",
              transition: "border-color 0.2s ease, background 0.2s ease",
              "&:hover": { borderColor: "secondary.main", background: "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(16,26,44,0.98) 58%)" },
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700 }}>
                  Editor&rsquo;s pick · {featured.category}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                  01 / 04
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: { xs: 4, sm: 6 }, maxWidth: 540, fontSize: { xs: "1.75rem", sm: "2.25rem" }, lineHeight: 1.15 }}>
                {featured.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 470, color: "text.secondary" }}>
                {featured.description}
              </Typography>
            </Box>
            <Box sx={{ mt: 4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderTop: "1px solid rgba(255,255,255,0.12)", pt: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {featured.author} · {featured.readTime}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "secondary.main", fontSize: 14, fontWeight: 700 }}>
                Read story <ArrowRight size={16} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {sideArticles.map((article, i) => (
              <Box
                key={article.title}
                component="a"
                href="#articles"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "32px minmax(0, 1fr) 18px",
                  alignItems: "center",
                  gap: 1.5,
                  py: 2.25,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  textDecoration: "none",
                  "&:hover .article-title": { color: "secondary.main" },
                  "&:hover .article-arrow": { transform: "translateX(3px)" },
                }}
              >
                <Typography variant="body2" sx={{ alignSelf: "start", pt: 0.2, color: "text.disabled", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  0{i + 2}
                </Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "primary.main" }}>
                    {article.category}
                  </Typography>
                  <Typography
                    variant="body1"
                    className="article-title"
                    sx={{
                      mt: 0.5,
                      fontFamily: "var(--font-heading)",
                      lineHeight: 1.3,
                      color: "text.primary",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 0.75, display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                    {article.author} <span aria-hidden="true">·</span> <Clock size={12} /> {article.readTime}
                  </Typography>
                </Box>
                <ArrowRight className="article-arrow" size={16} color="currentColor" style={{ transition: "transform 0.2s ease" }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
