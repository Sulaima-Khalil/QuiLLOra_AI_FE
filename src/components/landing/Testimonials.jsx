import { useRef, useState } from "react";
import { Box, Container, Typography, IconButton, Avatar } from "@mui/material";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import { scrollIntoViewGently } from "../../utils/motion";

const testimonials = [
  {
    quote: "QuiLLora AI transformed the way I write and publish. The AI suggestions are incredibly accurate and save me so much time.",
    name: "Sarah Johnson",
    role: "Tech Writer",
    rating: 5,
  },
  {
    quote: "The best platform for creators who want to scale their content without compromising quality. Highly recommended!",
    name: "Michael Chen",
    role: "Entrepreneur",
    rating: 5,
  },
  {
    quote: "From writing to SEO to analytics, everything I need is in one place. QuiLLora AI is a game-changer.",
    name: "Emma Davis",
    role: "Content Creator",
    rating: 5,
  },
  {
    quote: "The SEO suggestions alone got three of my articles ranking on page one within a month. Genuinely impressive.",
    name: "David Okafor",
    role: "Marketing Lead",
    rating: 5,
  },
  {
    quote: "It feels like having an editor, researcher, and publisher on call 24/7. My publishing cadence has tripled.",
    name: "Priya Nair",
    role: "Newsletter Writer",
    rating: 4,
  },
];

const getInitials = (name) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const palette = ["primary.main", "secondary.main", "warning.main"];

export default function Testimonials() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, testimonials.length - 1));
    const card = track.children[clamped];
    scrollIntoViewGently(card, { inline: "start", block: "nearest" });
    setActive(clamped);
  };

  return (
    <Box component="section" id="testimonials" sx={{ bgcolor: brandColors.bgSecondary }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
              Loved by Writers Worldwide
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
              What Our Writers Say
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography component="a" href="#testimonials" variant="body2" sx={{ fontWeight: 600, color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
              View all testimonials →
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                aria-label="Previous testimonial"
                onClick={() => scrollToIndex(active - 1)}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <ChevronLeft size={18} />
              </IconButton>
              <IconButton
                aria-label="Next testimonial"
                onClick={() => scrollToIndex(active + 1)}
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <ChevronRight size={18} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box
          ref={trackRef}
          sx={{
            display: "flex",
            gap: 3,
            overflowX: "auto",
            pb: 1,
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {testimonials.map((t, i) => (
            <Box
              key={t.name}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flexShrink: 0,
                scrollSnapAlign: "start",
                width: "100%",
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: 1,
                "@media (min-width:600px)": { width: "calc(50% - 12px)" },
                "@media (min-width:1200px)": { width: "calc(33.333% - 16px)" },
              }}
            >
              <Quote size={24} color="rgba(14,111,92,0.4)" />
              <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
                &ldquo;{t.quote}&rdquo;
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderTop: "1px solid", borderColor: "divider", pt: 2 }}>
                <Avatar sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: palette[i % palette.length] }}>
                  {getInitials(t.name)}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: "var(--font-button)", fontWeight: 600 }}>{t.name}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{t.role}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 0.25, color: "warning.main" }}>
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} size={14} fill={brandColors.accentGold} />
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 1 }}>
          {testimonials.map((t, i) => (
            <Box
              key={t.name}
              component="button"
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              sx={{
                height: 8,
                width: active === i ? 24 : 8,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                bgcolor: active === i ? "primary.main" : "divider",
                transition: "all 0.2s",
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
