import { Box, Stack, Typography } from "@mui/material";
import { brandColors } from "../theme/muiTheme";
import QuilloraMark from "./brand/QuilloraMark";

const SIZES = {
  sm: { mark: 32, word: "1.05rem", chip: 8.5 },
  md: { mark: 40, word: "1.3rem", chip: 9.5 },
  lg: { mark: 56, word: "1.7rem", chip: 11 },
};

// Reusable brand lockup: the QuiLLora quill mark paired with an editorial
// serif wordmark and an "AI" chip.
export default function Logo({ size = "md", showWord = true, color = "#fff" }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <Stack direction="row" spacing={1.1} sx={{ alignItems: "center" }}>
      <QuilloraMark size={s.mark} title="QuiLLora AI" style={{ flexShrink: 0 }} />

      {showWord && (
        <Stack direction="row" spacing={0.6} sx={{ alignItems: "center" }}>
          <Typography sx={{ fontFamily: "'DM Serif Display', serif", fontSize: s.word, lineHeight: 1, color, letterSpacing: "-0.01em" }}>
            QuiLLora
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
