import { Box, Typography, Button, Stack } from "@mui/material";
import { TriangleAlert, RefreshCw } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

/**
 * Full-page recovery screen, shared by the top-level ErrorBoundary and the
 * bootstrap failure path in App.
 *
 * The wording stays deliberately generic: the real error goes to the console
 * for debugging, never onto the screen, so stack traces and endpoint details
 * are not shown to the user.
 *
 * This renders above the router, so the escape hatches are plain anchors
 * rather than <Link> — a fresh document load is also the surest way out of a
 * tree that has already crashed.
 */
export default function ErrorFallback({
  title = "Something went wrong",
  description = "The page ran into an unexpected problem. Trying again usually clears it.",
  onRetry,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        bgcolor: brandColors.bg,
        textAlign: "center",
      }}
    >
      <Stack spacing={2.5} sx={{ alignItems: "center", maxWidth: 420 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: brandColors.hover,
            color: brandColors.primary,
          }}
        >
          <TriangleAlert size={30} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: brandColors.heading }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: brandColors.text }}>
          {description}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ width: { xs: "100%", sm: "auto" }, pt: 1 }}
        >
          <Button
            component="a"
            href="/"
            variant="outlined"
            sx={{ color: brandColors.heading, borderColor: brandColors.border }}
          >
            Back to Home
          </Button>
          <Button
            component="a"
            href="/dashboard"
            variant="outlined"
            sx={{ color: brandColors.heading, borderColor: brandColors.border }}
          >
            Go to Dashboard
          </Button>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
            >
              Try again
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
