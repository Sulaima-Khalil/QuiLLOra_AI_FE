import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Box, Typography, Stack, Button, Chip, Divider } from "@mui/material";
import { Check, Sparkles, BarChart3, Users, Download } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import UpgradeLayout from "@/components/upgrade/UpgradeLayout";
import { getSubscription, planById, priceFor, chargeFor, formatDate } from "@/utils/planStore";

const NEXT_STEPS = [
  {
    icon: Sparkles,
    title: "Write with unlimited AI",
    body: "Your daily cap is gone. Open the AI Writer and draft as much as you like.",
    to: "/dashboard/ai-writer",
    cta: "Open AI Writer",
  },
  {
    icon: BarChart3,
    title: "Track how articles perform",
    body: "The analytics dashboard is now unlocked, with full audience breakdowns.",
    to: "/dashboard/analytics",
    cta: "View analytics",
  },
  {
    icon: Users,
    title: "Bring your team in",
    body: "Invite collaborators and work on drafts together in real time.",
    to: "/dashboard/team",
    cta: "Invite teammates",
  },
];

export default function UpgradeSuccess() {
  const [subscription] = useState(getSubscription);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Nobody should land here without having gone through checkout.
  if (!subscription.startedAt || subscription.planId === "starter") {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  const plan = planById(subscription.planId);
  const { cycle } = subscription;
  const charge = chargeFor(plan, cycle);

  return (
    <UpgradeLayout maxWidth={860}>
      {/* Confirmation */}
      <Box sx={{ textAlign: "center", pt: { xs: 2, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 76,
            height: 76,
            mx: "auto",
            borderRadius: "50%",
            bgcolor: "rgba(45,212,191,0.12)",
            border: `2px solid ${brandColors.mint}`,
            transform: mounted ? "scale(1)" : "scale(0.6)",
            opacity: mounted ? 1 : 0,
            transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s",
          }}
        >
          <Check size={36} color={brandColors.mint} strokeWidth={3} />
        </Box>

        <Typography variant="h3" sx={{ mt: 3, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
          You're on {plan.name}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary", maxWidth: 460, mx: "auto" }}>
          Your {plan.trialDays}-day free trial has started. Everything in {plan.name} is unlocked
          right now — we'll email a receipt to your account address.
        </Typography>
      </Box>

      {/* Receipt */}
      <Box
        sx={{
          mt: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 3,
            py: 2,
            alignItems: "center",
            bgcolor: brandColors.dark,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 800, color: brandColors.mint }}>
              Current plan
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, mt: 0.25 }}>
              {plan.name}
            </Typography>
          </Box>
          <Chip
            label="Trial active"
            size="small"
            sx={{ bgcolor: "rgba(45,212,191,0.15)", color: brandColors.mint, fontWeight: 700, fontSize: 11 }}
          />
        </Stack>

        <Stack spacing={1.5} sx={{ p: 3 }}>
          {[
            { label: "Billing cycle", value: cycle === "yearly" ? "Yearly" : "Monthly" },
            { label: "Rate", value: `$${priceFor(plan, cycle)}/month` },
            { label: "Charged today", value: "$0.00" },
            { label: "First charge", value: `$${charge} on ${formatDate(subscription.renewsAt)}` },
            subscription.card && {
              label: "Payment method",
              value: `${subscription.card.brand} ending ${subscription.card.last4}`,
            },
          ]
            .filter(Boolean)
            .map((row) => (
              <Stack key={row.label} direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontSize: 13.5, color: "text.secondary" }}>
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                  {row.value}
                </Typography>
              </Stack>
            ))}

          <Divider sx={{ my: 0.5 }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              component={Link}
              to="/dashboard/write"
              fullWidth
              sx={{
                fontWeight: 800,
                bgcolor: brandColors.mint,
                color: brandColors.dark,
                "&:hover": { bgcolor: brandColors.secondary },
              }}
            >
              Start writing
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download size={15} />}
              sx={{ fontWeight: 700 }}
            >
              Download receipt
            </Button>
            <Button
              component={Link}
              to="/dashboard/setting"
              fullWidth
              variant="outlined"
              sx={{ fontWeight: 700 }}
            >
              Manage billing
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* What's unlocked */}
      <Typography variant="h6" sx={{ mt: 5, mb: 2, textAlign: "center", fontSize: 18 }}>
        What's unlocked
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {NEXT_STEPS.map(({ icon: Icon, title, body, to, cta }) => (
          <Box
            key={title}
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "border-color 0.2s",
              "&:hover": { borderColor: brandColors.primary },
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: brandColors.bgSecondary,
              }}
            >
              <Icon size={17} color={brandColors.mint} />
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 700, color: "text.primary" }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.5, flex: 1, color: "text.secondary", lineHeight: 1.6 }}>
              {body}
            </Typography>
            <Button
              component={Link}
              to={to}
              size="small"
              sx={{ mt: 1.5, px: 0, justifyContent: "flex-start", fontWeight: 700, color: brandColors.mint, "&:hover": { bgcolor: "transparent" } }}
            >
              {cta} →
            </Button>
          </Box>
        ))}
      </Box>
    </UpgradeLayout>
  );
}
