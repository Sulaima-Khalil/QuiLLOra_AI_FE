import { createTheme } from "@mui/material/styles";

// Unified dark "lights-out" editorial theme — matches the AI Writer screen:
// deep navy surfaces with bright teal accents.
const brand = {
  bg: "#0b1220",              // app background (deep navy)
  bgSecondary: "#101a2c",     // raised navy (table heads, subtle fills)
  card: "#101a2c",            // cards / panels
  border: "rgba(255,255,255,0.08)",
  heading: "#e7ebf3",         // primary text
  text: "#8b95a7",            // secondary / dim text
  primary: "#0f9e8c",         // deep teal — readable with white text
  primaryDark: "#0c8375",
  secondary: "#2dd4bf",       // bright teal accent
  accentGold: "#E3B448",
  hover: "rgba(45,212,191,0.12)",
  dark: "#0b1220",            // deepest navy (sidebar / dark buttons)
  darkCard: "#101a2c",
  darkBorder: "rgba(255,255,255,0.08)",
  mint: "#2dd4bf",            // bright teal (dots, rings, highlights)
  outline: "#5b6478",
};

const shadowStack = (alpha) => [
  "none",
  ...Array.from({ length: 24 }, (_, i) => {
    const blur = i < 2 ? 2 + i * 4 : i < 5 ? 20 : i < 8 ? 28 : 40;
    const y = i < 2 ? 1 + i : i < 5 ? 6 : i < 8 ? 10 : 16;
    const spread = i < 2 ? 0 : i < 5 ? 0 : i < 8 ? -3 : 0;
    return `0 ${y}px ${blur}px ${spread}px rgba(0,0,0,${alpha})`;
  }),
];

export const createAppTheme = () => {
  const surfaces = brand;

  return createTheme({
    palette: {
      mode: "dark",
      primary: { main: brand.primary, dark: brand.primaryDark, contrastText: "#FFFFFF" },
      secondary: { main: brand.secondary, contrastText: "#06231f" },
      warning: { main: brand.accentGold, contrastText: "#0C2B26" },
      background: { default: surfaces.bg, paper: surfaces.card },
      text: { primary: surfaces.heading, secondary: surfaces.text },
      divider: surfaces.border,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      h2: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      h3: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      h4: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      h5: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      h6: { fontFamily: "'DM Serif Display', Georgia, serif", fontWeight: 400 },
      button: { fontFamily: "'Manrope', sans-serif", fontWeight: 600, textTransform: "none" },
    },
    shadows: shadowStack(0.35),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: surfaces.bg,
            color: surfaces.heading,
          },
          a: { color: brand.mint, textDecoration: "none" },
          "::selection": { background: brand.mint, color: "#06231f" },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 20, paddingBlock: 10 },
          containedPrimary: {
            "&:hover": { backgroundColor: brand.primaryDark },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: `1px solid ${surfaces.border}`,
            boxShadow: "none",
            backgroundColor: surfaces.card,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 500 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            border: `1px solid ${surfaces.border}`,
            borderRadius: 14,
            marginBottom: 12,
            backgroundColor: surfaces.card,
            "&:before": { display: "none" },
          },
        },
      },
    },
  });
};

export const muiTheme = createAppTheme();

export const brandColors = brand;

export default muiTheme;
