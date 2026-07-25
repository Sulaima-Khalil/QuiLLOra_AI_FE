import { Box, Stack, Typography } from "@mui/material";
import { brandColors } from "../theme/muiTheme";

const SIZES = {
  sm: { box: 30, glyph: 17, word: "1.05rem", chip: 8.5 },
  md: { box: 38, glyph: 22, word: "1.3rem", chip: 9.5 },
};

// Reusable brand lockup: a fountain-pen nib mark (ink + writing) in a
// gradient squircle, paired with an editorial serif wordmark.
export default function Logo({ size = "md", showWord = true, color = "#fff" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <Stack direction="row" spacing={1.1} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          width: s.box,
          height: s.box,
          flexShrink: 0,
          borderRadius: `${Math.round(s.box * 0.34)}px`,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(140deg, ${brandColors.secondary} 0%, ${brandColors.primary} 55%, ${brandColors.primaryDark} 100%)`,
          boxShadow: `0 6px 16px ${brandColors.primary}55`,
        }}
      >
        <Box component="svg" width={s.glyph} height={s.glyph} viewBox="0 0 24 24" fill="none" aria-hidden>
          {/* pen nib */}
          <path d="M12 3.2 L16.6 12 L12 20.8 L7.4 12 Z" fill="#fff" />
          {/* vent hole + slit */}
          <circle cx="12" cy="11" r="1.4" fill={brandColors.primary} />
          <path d="M12 12.5 L12 19.4" stroke={brandColors.primary} strokeWidth="1.3" strokeLinecap="round" />
        </Box>
      </Box>

      {showWord && (
        <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
          <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: s.word, lineHeight: 1, color, letterSpacing: "-0.01em" }}>
            Inkflow
          </Typography>
          <Box
            sx={{
              px: 0.6,
              py: 0.2,
              borderRadius: 0.8,
              bgcolor: "rgba(45,212,191,0.16)",
              border: "1px solid rgba(45,212,191,0.4)",
              lineHeight: 1,
            }}
          >
            <Typography sx={{ fontFamily: "'Manrope', sans-serif", fontSize: s.chip, fontWeight: 800, letterSpacing: 1, color: brandColors.secondary }}>
              AI
            </Typography>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
