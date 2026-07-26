import { Box, Typography, Stack, IconButton } from "@mui/material";
import { SlidersHorizontal } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";
import { FilterInput } from "../shared/FilterInput";

export const DiscoveryHeader = ({ query, onQueryChange, hideFilter = false }) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { md: "flex-end" }
      }}>
      <Box>
        <Typography
          variant="h4"
          sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.75rem" }, color: "text.primary" }}
        >
          Discover
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Explore the latest thoughts on design and technology from our writers.
        </Typography>
      </Box>
      {/* The local filter narrows the loaded feed, which has no meaning while
          global search results are on screen. */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ width: { xs: "100%", md: "auto" }, display: hideFilter ? "none" : "flex" }}
      >
        <FilterInput
          value={query}
          onChange={onQueryChange}
          placeholder="Filter articles..."
          sx={{ flex: { xs: 1, md: "0 0 280px" } }}
        />
        <IconButton
          aria-label="Filter options"
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.secondary",
            "&:hover": { color: brandColors.primary, borderColor: brandColors.primary },
          }}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
        </IconButton>
      </Stack>
    </Stack>
  );
};
