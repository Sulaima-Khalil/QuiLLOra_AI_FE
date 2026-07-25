import { Box, Container, Typography, Stack } from "@mui/material";
import { brandColors } from "@/theme/muiTheme";

const logos = ["NVIDIA", "Framer", "Notion", "Vercel", "HubSpot"];

export default function TrustedBy() {
  return (
    <Box sx={{ borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", bgcolor: brandColors.bgSecondary }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", mb: 3, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", color: "text.secondary" }}
        >
          Trusted by forward-thinking teams and creators
        </Typography>
        <Stack direction="row" spacing={6} sx={{ rowGap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          {logos.map((logo) => (
            <Typography
              key={logo}
              variant="h6"
              sx={{
                color: "text.primary",
                opacity: 0.35,
                filter: "grayscale(1)",
                transition: "opacity 0.2s",
                "&:hover": { opacity: 0.7 },
              }}
            >
              {logo}
            </Typography>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
