import { Stack, InputBase } from "@mui/material";
import { ListFilter } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

/**
 * A flat, tinted "filter this list" control — deliberately styled unlike the
 * global topbar search (bordered white pill) so the two are never mistaken
 * for the same control.
 */
export const FilterInput = ({ value, onChange, placeholder, label, sx }) => (
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
    <ListFilter size={15} aria-hidden="true" />
    {/*
      The design has no room for a visible label, so the name is supplied
      through aria-label — the placeholder cannot carry it, because it is gone
      the moment anyone types and a field that loses its name mid-edit is
      exactly the case the rule exists for.

      Callers that pass a bare placeholder still get a usable name from it;
      `label` lets a caller say something better.
    */}
    <InputBase
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      inputProps={{ "aria-label": label || placeholder || "Filter" }}
      sx={{ flex: 1, fontSize: 14 }}
    />
  </Stack>
);
