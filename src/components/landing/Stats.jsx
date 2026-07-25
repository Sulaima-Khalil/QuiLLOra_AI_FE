import { Box, Container, Typography } from "@mui/material";

const stats = [
  { value: "250K+", label: "Articles Published" },
  { value: "120K+", label: "Active Writers" },
  { value: "98.6%", label: "User Satisfaction" },
  { value: "50M+", label: "Monthly Readers" },
];

export default function Stats() {
  return (
    <Box component="section" sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
            gap: 4,
          }}
        >
          {stats.map((stat) => (
            <Box key={stat.label} sx={{ textAlign: "center" }}>
              <Typography variant="h3" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, color: "text.primary" }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 0.75, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "text.secondary" }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
