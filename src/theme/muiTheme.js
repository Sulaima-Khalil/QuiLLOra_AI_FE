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
  /*
   * Hairlines, dividers and decorative icon strokes.
   *
   * At 3.2:1 on the app background this clears the 3:1 bar for non-text
   * graphics but not the 4.5:1 one for body copy, so it must not be used as a
   * text colour — `textMuted` below exists for the captions that used to.
   */
  outline: "#5b6478",
  /*
   * The dimmest colour still readable as text on the navy surfaces (4.6:1).
   * Reads as "quiet" next to `text` without dropping below AA.
   */
  textMuted: "#7d879b",
};

/**
 * The app-wide keyboard focus ring.
 *
 * MUI's ButtonBase sets `outline: 0` on its root, and a class selector beats
 * the bare `:focus-visible` rule in index.css — so every Button, IconButton,
 * MenuItem, Tab and ListItemButton in the app had no visible focus indicator
 * at all, only the ripple. Re-establishing it on `.Mui-focusVisible` is the
 * single change that makes keyboard navigation followable.
 *
 * The dark inner ring is what makes one style work everywhere: mint alone is
 * 10:1 on the navy surfaces but only 1.9:1 against the white editor canvas,
 * and the shadow sits in the 2px offset gap, invisible on dark and separating
 * on light.
 */
const focusRing = {
  outline: `2px solid ${brand.mint}`,
  outlineOffset: "2px",
  boxShadow: `0 0 0 2px rgba(11,18,32,0.9)`,
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
      /*
       * `disabled` is raised from MUI's dark-mode default of 0.5 white to a
       * flat colour at 3.6:1. Disabled controls are exempt from the contrast
       * minimum, but the default rendered at 2.7:1 — dim enough that "is this
       * off, or is my screen bad?" was a fair question.
       */
      text: { primary: surfaces.heading, secondary: surfaces.text, disabled: "#6c7688" },
      action: {
        disabled: "#6c7688",
        disabledBackground: "rgba(255,255,255,0.08)",
      },
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
    shadows: shadowStack(0.16),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: surfaces.bg,
            color: surfaces.heading,
          },
          a: {
            color: brand.mint,
            textDecoration: "none",
            // Plain anchors are outside ButtonBase, so the browser outline
            // still applies — but it inherits `currentColor` by default, which
            // is invisible against a same-coloured link.
            "&:focus-visible": focusRing,
          },
          "::selection": { background: brand.mint, color: "#06231f" },

          /*
           * Reduced motion, applied once at the root rather than per
           * component.
           *
           * The cap is 0.01ms rather than 0 so transition- and animation-end
           * events still fire: MUI's Grow, Fade and Collapse unmount their
           * children from those callbacks, and a hard `none` can leave a
           * closed menu mounted forever.
           *
           * Scoped to animation and transition only. Hover, focus and active
           * styling are untouched, so every user keeps the feedback that tells
           * them a control responded.
           */
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        },
      },
      /*
       * One focus ring for everything ButtonBase powers — Button, IconButton,
       * MenuItem, Tab, ListItemButton, clickable Chip, CardActionArea.
       */
      MuiButtonBase: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 20,
            paddingBlock: 10,
            "&.Mui-focusVisible": focusRing,
          },
          containedPrimary: {
            "&:hover": { backgroundColor: brand.primaryDark },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          // Menu items move focus as you arrow through them, so without this
          // there is nothing on screen tracking where you are in the list.
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 500 },
          clickable: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          // The ring belongs on the thumb's ButtonBase, not the track, or it
          // draws a rectangle around the whole control.
          switchBase: { "&.Mui-focusVisible .MuiSwitch-thumb": focusRing },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            /*
             * MUI dims placeholders to 0.5 opacity in dark mode, which put
             * this palette's placeholder text at 2.5:1 — below the minimum,
             * and these placeholders carry format hints ("name@organization
             * .com") that a user has to be able to read.
             *
             * Full opacity at the secondary text colour is 6.3:1 and still
             * reads as placeholder rather than value, because the value above
             * it is the brighter primary colour.
             */
            "&::placeholder": { color: surfaces.text, opacity: 1 },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          // Fields show focus through their own border; the offset ring would
          // sit awkwardly outside a full-width input.
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
              borderColor: brand.mint,
            },
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
