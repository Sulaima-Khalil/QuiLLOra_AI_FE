import { Box, Container, Typography } from "@mui/material";
import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import Logo from "../Logo";
import { brandColors } from "@/theme/muiTheme";

const columns = [
  { title: "Product", links: ["Features", "AI Writing", "SEO Tools", "Publishing", "Analytics"] },
  { title: "Resources", links: ["Blog", "Help Center", "Guides", "Templates", "API Docs"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Refund Policy"] },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: brandColors.dark, color: "#fff" }}>
      <Container maxWidth="lg" sx={{ py: 7 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1.6fr repeat(3, 1fr)" }, gap: 5 }}>
          <Box>
            <Logo size="md" />
            <Typography variant="body2" sx={{ mt: 2, maxWidth: 280, color: "rgba(255,255,255,0.6)" }}>
              The AI-powered platform for writing, publishing, and growing your
              ideas.
            </Typography>
            <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
              {[Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
                <Box
                  key={i}
                  component="a"
                  href="#"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `1px solid ${brandColors.darkBorder}`,
                    color: "rgba(255,255,255,0.6)",
                    transition: "color 0.2s, border-color 0.2s",
                    "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
                  }}
                >
                  <Icon size={16} />
                </Box>
              ))}
            </Box>
          </Box>

          {columns.map((col) => (
            <Box key={col.title}>
              <Typography variant="body2" sx={{ fontFamily: "var(--font-button)", fontWeight: 700, color: "#fff" }}>
                {col.title}
              </Typography>
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                {col.links.map((link) => (
                  <Typography
                    key={link}
                    component="a"
                    href="#"
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", "&:hover": { color: "secondary.main" } }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 6, borderTop: `1px solid ${brandColors.darkBorder}`, pt: 3, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} InkFlow AI. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
