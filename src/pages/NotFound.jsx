import { Box, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { brandColors } from "../theme/muiTheme";
import Logo from "../components/Logo";

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        bgcolor: "background.default",
        textAlign: "center",
      }}
    >
      <Stack
        spacing={2.5}
        sx={{
          alignItems: "center",
          maxWidth: 420
        }}>
        <Link to="/" aria-label="QuiLLora AI home">
          <Logo size="md" />
        </Link>
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
          <Compass size={30} />
        </Box>
        <Typography
          variant="h1"
          sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "3rem", sm: "4rem" }, color: "text.primary", lineHeight: 1 }}
        >
          404
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          This page has drifted off the map
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          The page you're looking for doesn't exist or may have been moved.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" }, pt: 1 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            sx={{ color: "text.primary", borderColor: "divider" }}
          >
            Back to Home
          </Button>
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotFound;
