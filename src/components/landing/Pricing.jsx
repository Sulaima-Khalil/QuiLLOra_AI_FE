import { useState } from "react";
import { Box, Container, Typography, Switch, Chip, Button, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { brandColors } from "@/theme/muiTheme";

const plans = [
  {
    name: "Starter",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    features: ["5 AI Writes / day", "3 Published Articles", "Basic SEO Tools", "Community Support"],
    cta: "Start Free",
    variant: "outlined",
  },
  {
    name: "Pro",
    price: { monthly: 19, yearly: 15 },
    description: "For serious writers & creators",
    features: ["Unlimited Articles", "Unlimited AI Writes", "Advanced SEO Tools", "Analytics Dashboard", "Priority Support"],
    cta: "Start 7-Day Free Trial",
    highlight: true,
  },
  {
    name: "Business",
    price: { monthly: 49, yearly: 39 },
    description: "For teams & businesses",
    features: ["Everything in Pro", "Team Collaboration", "Custom Domain", "Advanced Analytics", "Dedicated Support"],
    cta: "Contact Sales",
    variant: "outlined",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <Box component="section" id="pricing">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ maxWidth: 640, mx: "auto", textAlign: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "primary.main" }}>
            Simple Pricing
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.875rem", sm: "2.25rem" } }}>
            Choose The Plan That Fits You
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
            All plans include a 7-day free trial. Scale your writing at your own pace.
          </Typography>

          <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: yearly ? "text.secondary" : "text.primary" }}>
              Monthly
            </Typography>
            <Switch checked={yearly} onChange={(e) => setYearly(e.target.checked)} color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 600, color: yearly ? "text.primary" : "text.secondary" }}>
              Yearly
            </Typography>
            <Chip label="Save 20%" size="small" sx={{ bgcolor: "secondary.main", color: brandColors.dark, fontWeight: 600 }} />
          </Box>
        </Box>

        <Box sx={{ mt: 6, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {plans.map((plan) => (
            <Box
              key={plan.name}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                p: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: plan.highlight ? brandColors.dark : "divider",
                bgcolor: plan.highlight ? brandColors.dark : "background.paper",
                color: plan.highlight ? "#fff" : "text.primary",
                boxShadow: plan.highlight ? 9 : 1,
                transform: { lg: plan.highlight ? "scale(1.05)" : "none" },
              }}
            >
              {plan.highlight && (
                <Chip
                  label="Most Popular"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "secondary.main",
                    color: brandColors.dark,
                    fontWeight: 700,
                  }}
                />
              )}
              <Typography variant="h5" sx={{ fontSize: "1.25rem", color: "inherit" }}>{plan.name}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: plan.highlight ? "rgba(255,255,255,0.65)" : "text.secondary" }}>
                {plan.description}
              </Typography>
              <Typography variant="h3" sx={{ mt: 3, fontSize: "2.25rem", color: "inherit" }}>
                ${yearly ? plan.price.yearly : plan.price.monthly}
                <Typography component="span" variant="body1" sx={{ fontFamily: "var(--font-body)", color: plan.highlight ? "rgba(255,255,255,0.65)" : "text.secondary" }}>
                  /month
                </Typography>
              </Typography>

              <List sx={{ mt: 2, flex: 1 }}>
                {plan.features.map((feature) => (
                  <ListItem key={feature} disableGutters sx={{ py: 0.5, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                      <Check size={16} color={brandColors.secondary} />
                    </ListItemIcon>
                    <ListItemText
                      slotProps={{
                        primary: {
                          variant: "body2",
                          sx: { color: plan.highlight ? "rgba(255,255,255,0.85)" : "text.secondary" },
                        },
                      }}
                      primary={feature}
                    />
                  </ListItem>
                ))}
              </List>

              <Button
                component={Link}
                to="/login"
                variant={plan.highlight ? "contained" : plan.variant}
                color={plan.highlight ? "secondary" : "primary"}
                fullWidth
                sx={{
                  mt: 3,
                  ...(plan.highlight && { bgcolor: "secondary.main", color: brandColors.dark, fontWeight: 700, "&:hover": { bgcolor: "#25AA82" } }),
                }}
              >
                {plan.cta}
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
