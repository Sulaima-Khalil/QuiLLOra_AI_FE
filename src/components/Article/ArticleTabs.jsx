import { Stack, Button } from "@mui/material";
import { brandColors } from "../../theme/muiTheme";

export const ArticleTabs = ({ activetab, setActiveTab }) => {
  const tabs = ["All Articles", "Published", "Drafts"];

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          size="small"
          onClick={() => setActiveTab(index)}
          sx={{
            px: 2,
            borderRadius: 2,
            fontWeight: 600,
            ...(activetab === index
              ? { bgcolor: brandColors.dark, color: "#fff", "&:hover": { bgcolor: brandColors.primaryDark } }
              : { bgcolor: "#E9EDEB", color: "text.secondary", "&:hover": { bgcolor: brandColors.hover } }),
          }}
        >
          {tab}
        </Button>
      ))}
    </Stack>
  );
};
