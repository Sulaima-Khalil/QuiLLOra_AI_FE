import { Link } from "react-router-dom";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        minHeight: { xs: 560, md: 640 },
        overflow: "hidden",
        bgcolor: "#0b1220",
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: {
            xs: 'linear-gradient(180deg, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0.88) 46%, #0b1220 100%), url("https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2200&q=85")',
            md: 'linear-gradient(90deg, #0b1220 0%, rgba(11,18,32,0.94) 34%, rgba(11,18,32,0.62) 66%, rgba(11,18,32,0.38) 100%), url("https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2200&q=85")',
          },
          backgroundSize: "cover",
          backgroundPosition: { xs: "63% center", md: "center 54%" },
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            maxWidth: 700,
          }}
        >
            <Typography
              variant="overline"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: "secondary.main", fontWeight: 700 }}
            >
              <Sparkles size={15} /> AI writing assistant
            </Typography>
            <Typography variant="h1" sx={{ mt: 1.5, maxWidth: 680, fontSize: { xs: "2.8rem", sm: "3.5rem", lg: "4.25rem" }, lineHeight: 1.05 }}>
              Your next great draft starts here.
              <br />
              <Box component="span" sx={{ color: "secondary.main" }}>
                Make every word count.
              </Box>
            </Typography>

            <Typography variant="body1" sx={{ mt: 2.5, maxWidth: 440, color: "rgba(231,235,243,0.78)", fontSize: "1.05rem" }}>
              Shape rough ideas into clear, confident stories with an AI writing assistant that works with your voice.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5, alignItems: { xs: "stretch", sm: "center" } }}>
              <Button component={Link} to="/register" size="large" variant="contained" endIcon={<ArrowRight size={18} />}>
                Start writing for free
              </Button>
              <Button component="a" href="#features" size="large" variant="text" sx={{ color: "text.primary" }}>
                Explore features
              </Button>
            </Stack>
        </Box>
      </Container>
    </Box>
  );
}
