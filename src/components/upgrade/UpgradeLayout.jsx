import { Link } from "react-router-dom";
import { Box, Stack, Typography, IconButton, Tooltip } from "@mui/material";
import { X } from "lucide-react";
import QuilloraMark from "../brand/QuilloraMark";
import { brandColors } from "../../theme/muiTheme";

/**
 * Standalone shell for the upgrade flow.
 *
 * These routes sit outside the dashboard layout on purpose — no sidebar and no
 * app top bar, so nothing competes with the plan choice. All that's left is the
 * wordmark and a way out.
 */
export default function UpgradeLayout({ children, maxWidth = 1180, exitTo = "/dashboard" }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: brandColors.bg }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: 2.5,
        }}
      >
        <Stack
          component={Link}
          to={exitTo}
          direction="row"
          spacing={1.25}
          sx={{ alignItems: "center", textDecoration: "none" }}
        >
          <QuilloraMark size={32} style={{ flexShrink: 0 }} />
          <Typography variant="h6" sx={{ color: "#fff" }}>
            QuiLLora <Box component="span" sx={{ color: brandColors.mint }}>AI</Box>
          </Typography>
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Close" placement="left">
          <IconButton
            component={Link}
            to={exitTo}
            size="small"
            aria-label="Close and return to dashboard"
            sx={{
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "text.primary" },
            }}
          >
            <X size={17} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ maxWidth, mx: "auto", px: { xs: 2, md: 3 }, pb: 8 }}>{children}</Box>
    </Box>
  );
}
