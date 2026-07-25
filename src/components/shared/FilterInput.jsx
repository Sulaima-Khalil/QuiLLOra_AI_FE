import { Stack, InputBase } from "@mui/material";
import { ListFilter } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

/**
 * A flat, tinted "filter this list" control — deliberately styled unlike the
 * global topbar search (bordered white pill) so the two are never mistaken
 * for the same control.
 */
export const FilterInput = ({ value, onChange, placeholder, sx }) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{
      alignItems: "center",
      px: 2,
      py: 1,
      borderRadius: 2,
      bgcolor: brandColors.bgSecondary,
      color: "text.secondary",
      ...sx,
    }}
  >
    <ListFilter size={15} />
    <InputBase
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      sx={{ flex: 1, fontSize: 14 }}
    />
  </Stack>
);
