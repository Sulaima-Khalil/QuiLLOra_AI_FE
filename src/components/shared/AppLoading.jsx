import { Box, Stack, Typography, Button, CircularProgress } from "@mui/material";
import QuilloraMark from "../brand/QuilloraMark";
import { brandColors } from "../../theme/muiTheme";

/**
 * Full-page loader, shared by two waits so they look identical: the start-up
 * session check, and the Suspense fallback while a route chunk downloads.
 *
 * The session check is normally a few hundred milliseconds; `slow` flips on
 * when it outlasts that by enough to look broken, adding a retry so a hung
 * request is not a dead end while the request's own timeout runs down. Route
 * chunks pass neither, so they get the spinner alone.
 */
export default function AppLoading({ slow = false, onRetry, message = "Loading your workspace…" }) {
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
      {/*
        `role="status"` on the group rather than `aria-live` on the text alone.
        A live region only announces changes made after it mounts, so the
        original markup said nothing on first paint — which is precisely when
        the screen is otherwise empty. As a status region the whole thing is
        read on arrival, and again when "Still connecting…" replaces it.
      */}
      <Stack role="status" spacing={2.5} sx={{ alignItems: "center", maxWidth: 380 }}>
        <QuilloraMark size={44} style={{ flexShrink: 0 }} />

        {/* The text below is the announcement; a second "progress bar" from
            the spinner's implicit role would just be noise. */}
        <CircularProgress
          size={26}
          thickness={4}
          aria-hidden="true"
          sx={{ color: brandColors.mint }}
        />

        <Typography variant="body2" sx={{ color: brandColors.text }}>
          {slow ? "Still connecting…" : message}
        </Typography>

        {slow && (
          <>
            <Typography variant="caption" sx={{ color: brandColors.textMuted }}>
              This is taking longer than usual. Your connection may be down.
            </Typography>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outlined"
                size="small"
                sx={{ color: brandColors.heading, borderColor: brandColors.border }}
              >
                Try again
              </Button>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
