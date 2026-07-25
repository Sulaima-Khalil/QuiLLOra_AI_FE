import { Box, Typography, Stack, Button } from "@mui/material";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { brandColors } from "../../theme/muiTheme";

export const ArticleHeader = () => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { sm: "flex-end" },
      }}
    >
      <Box>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: brandColors.secondary }} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: brandColors.secondary }}>
            EDITORIAL WORKSPACE
          </Typography>
        </Stack>
        <Typography
          variant="h4"
          sx={{ mt: 0.5, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}
        >
          My Articles
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Manage your published work and drafts in one place.
        </Typography>
      </Box>
      <Button
        component={Link}
        to="/dashboard/write"
        variant="contained"
        startIcon={<Plus size={16} />}
        sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark }, alignSelf: { xs: "stretch", sm: "auto" } }}
      >
        New Article
      </Button>
    </Stack>
  );
};
