import { Box, Typography } from "@mui/material";
import { FileText, Users, UserCheck, Eye } from "lucide-react";
import { brandColors } from "../../theme/muiTheme";

const stats = [
  { icon: FileText, name: "Articles", count: "45" },
  { icon: Users, name: "Followers", count: "125" },
  { icon: UserCheck, name: "Following", count: "60" },
  { icon: Eye, name: "Total Views", count: "35.2K" },
];

export const ProfileCards = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        width: "100%",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(4, 1fr)",
        },
      }}
    >
      {stats.map(({ icon: Icon, name, count }) => (
        <Box
          key={name}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            py: 2.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <Icon size={16} color={brandColors.primary} />
          <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, color: "text.primary" }}>
            {count}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
