import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Stack,
  Button,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";
import { brandColors } from "@/theme/muiTheme";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Categories", href: "#categories" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <Box
      component="header"
      sx={{ position: "sticky", top: 0, zIndex: 1100, px: { xs: 2, md: 3 }, pt: { xs: 1.5, md: 2 } }}
    >
      {/* Floating glass pill */}
      <Stack
        direction="row"
        sx={{
          maxWidth: 1200,
          mx: "auto",
          alignItems: "center",
          gap: 2,
          px: { xs: 2, md: 2.5 },
          py: 1,
          borderRadius: 999,
          bgcolor: "rgba(16,26,44,0.72)",
          backdropFilter: "blur(16px)",
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.09)",
          boxShadow: "0 12px 36px -14px rgba(0,0,0,0.7)",
        }}
      >
        <Box component={Link} to="/" sx={{ textDecoration: "none", display: "inline-flex" }}>
          <Logo size="sm" />
        </Box>

        {/* Center links */}
        <Stack
          component="nav"
          aria-label="Primary"
          direction="row"
          spacing={3.5}
          sx={{ mx: "auto", display: { xs: "none", md: "flex" } }}
        >
          {navLinks.map((link) => (
            <Typography
              key={link.label}
              component="a"
              href={link.href}
              variant="body2"
              sx={{
                position: "relative",
                fontWeight: 500,
                color: "rgba(255,255,255,0.68)",
                textDecoration: "none",
                transition: "color 0.18s ease",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: -6,
                  width: 0,
                  height: 2,
                  borderRadius: 2,
                  bgcolor: brandColors.secondary,
                  transition: "width 0.22s ease",
                },
                "&:hover": { color: "#fff" },
                "&:hover::after": { width: "100%" },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Stack>

        {/* Right actions */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          <Button
            component={Link}
            to="/login"
            sx={{ color: "rgba(255,255,255,0.85)", borderRadius: 999, px: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" } }}
          >
            Sign In
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            sx={{
              borderRadius: 999,
              px: 2.5,
              background: `linear-gradient(135deg, ${brandColors.secondary} 0%, ${brandColors.primary} 100%)`,
              boxShadow: `0 8px 20px -6px ${brandColors.primary}aa`,
              "&:hover": { filter: "brightness(1.05)" },
            }}
          >
            Get Started
          </Button>
        </Stack>

        <IconButton
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={open}
          sx={{ ml: "auto", display: { xs: "inline-flex", md: "none" }, color: "#fff", border: "1px solid", borderColor: "rgba(255,255,255,0.12)", borderRadius: 2 }}
        >
          <Menu size={20} aria-hidden="true" />
        </IconButton>
      </Stack>

      {/*
        Mobile drawer. MUI's modal Drawer already traps focus, closes on
        Escape and returns focus to the trigger, so only the name is added.
      */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Site menu"
        slotProps={{ paper: { sx: { width: 288, bgcolor: brandColors.dark, borderLeft: "1px solid", borderColor: "divider" } } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Logo size="sm" />
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu" sx={{ color: "#fff" }}>
              <X size={20} aria-hidden="true" />
            </IconButton>
          </Stack>

          <List component="nav" aria-label="Primary" sx={{ mt: 2 }}>
            {navLinks.map((link) => (
              <ListItemButton
                key={link.label}
                component="a"
                href={link.href}
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 2, mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }} />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 1.5, borderColor: "divider" }} />

          <Stack spacing={1.25} sx={{ mt: 1 }}>
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="outlined"
              onClick={() => setOpen(false)}
              sx={{ borderRadius: 999, color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="contained"
              onClick={() => setOpen(false)}
              sx={{ borderRadius: 999, background: `linear-gradient(135deg, ${brandColors.secondary} 0%, ${brandColors.primary} 100%)` }}
            >
              Get Started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
