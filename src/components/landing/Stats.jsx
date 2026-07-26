import { Box, Container, Typography } from "@mui/material";

/*
 * Marketing copy on the public landing page — platform-wide claims, not any
 * signed-in user's data, and not derived from the API.
 *
 * Deliberately left as copy: the backend aggregates per-author totals only,
 * and `GET /analytics/summary` is scoped to the caller, so wiring these to it
 * would show one writer's numbers as if they were the whole platform's. If
 * these ever need to be real they need a platform-statistics endpoint; until
 * then they belong to whoever owns the marketing site copy.
 */
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
