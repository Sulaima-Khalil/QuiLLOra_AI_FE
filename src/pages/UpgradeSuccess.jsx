import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Box, Typography, Stack, Button, Chip, Divider, CircularProgress } from "@mui/material";
import { Check, Clock, Sparkles, BarChart3, Users, RefreshCw } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import UpgradeLayout from "@/components/upgrade/UpgradeLayout";
import {
  getSubscription,
  isSubscriptionLoaded,
  fetchSubscription,
  subscribeSubscription,
  planById,
  formatDate,
} from "@/utils/planStore";

/**
 * Where Safepay returns the browser after a payment.
 *
 * Landing here is not proof of anything. Safepay's redirect is a navigation a
 * user can trigger by typing the URL, and this page treats it that way: it
 * reads the plan from the server and reports what the server says, which is
 * either "active" or "we are still waiting to hear from Safepay".
 *
 * The distinction is the whole point. Payment is confirmed out of band, by a
 * signature-verified webhook, and there is a real window — usually seconds —
 * in which someone has genuinely paid and this page still says "confirming".
 * Saying so plainly is better than guessing right most of the time.
 */

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
  const [subscription, setSubscription] = useState(getSubscription);
  const [loaded, setLoaded] = useState(isSubscriptionLoaded);
  const [rechecking, setRechecking] = useState(false);

  const recheck = useCallback(async () => {
    setRechecking(true);
    try {
      await fetchSubscription();
    } catch {
      // Leave the last server answer on screen rather than inventing one.
    } finally {
      setRechecking(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeSubscription(setSubscription);
    // Re-read rather than trusting anything carried over from checkout.
    recheck();
    return unsubscribe;
  }, [recheck]);

  if (!loaded) {
    return (
      <UpgradeLayout maxWidth={860}>
        <Stack spacing={2} sx={{ alignItems: "center", py: { xs: 8, md: 12 } }}>
          <CircularProgress size={26} thickness={4} sx={{ color: brandColors.mint }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Checking your plan…
          </Typography>
        </Stack>
      </UpgradeLayout>
    );
  }

  const isActivePaid = subscription.planId !== "starter" && subscription.status === "active";
  const isPending = Boolean(subscription.pendingPlanId);

  // Nothing was requested and nothing is active — there is nothing to confirm.
  if (!isActivePaid && !isPending) {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  const plan = planById(isActivePaid ? subscription.planId : subscription.pendingPlanId);
  const cycle = isActivePaid ? subscription.cycle : subscription.pendingCycle || "monthly";

  return (
    <UpgradeLayout maxWidth={860}>
      <Box sx={{ textAlign: "center", pt: { xs: 2, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 76,
            height: 76,
            mx: "auto",
            borderRadius: "50%",
            bgcolor: isActivePaid ? "rgba(45,212,191,0.14)" : brandColors.hover,
            color: isActivePaid ? brandColors.mint : brandColors.primary,
          }}
        >
          {isActivePaid ? <Check size={34} /> : <Clock size={32} />}
        </Box>

        <Typography
          variant="h4"
          sx={{ mt: 2.5, fontSize: { xs: "1.6rem", md: "2rem" }, color: "text.primary" }}
        >
          {isActivePaid ? `You're on ${plan.name}` : "Confirming your payment"}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", maxWidth: 520, mx: "auto" }}>
          {isActivePaid
            ? `Your ${plan.name} plan is active${
                subscription.currentPeriodEnd
                  ? ` and renews on ${formatDate(subscription.currentPeriodEnd)}`
                  : ""
              }.`
            : `Your ${plan.name} plan switches on once Safepay confirms the payment to our servers, which usually takes a few moments. Returning to this page doesn't activate anything on its own — we only ever go by what Safepay tells us directly.`}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
          <Chip
            label={isActivePaid ? "Active" : "Awaiting confirmation"}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: 11,
              bgcolor: isActivePaid ? "rgba(45,212,191,0.15)" : "rgba(227,180,72,0.15)",
              color: isActivePaid ? brandColors.mint : brandColors.accentGold,
            }}
          />
          <Chip
            label={cycle === "yearly" ? "Yearly" : "Monthly"}
            size="small"
            sx={{ fontWeight: 700, fontSize: 11, bgcolor: brandColors.bgSecondary, color: "text.secondary" }}
          />
        </Stack>

        {!isActivePaid && (
          <Button
            onClick={recheck}
            disabled={rechecking}
            startIcon={<RefreshCw size={15} />}
            sx={{ mt: 2, fontWeight: 700, color: brandColors.mint }}
          >
            {rechecking ? "Checking…" : "Check again"}
          </Button>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          maxWidth: 460,
          mx: "auto",
        }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Plan</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>{plan.name}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>Billing</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {cycle === "yearly" ? "Yearly" : "Monthly"}
            </Typography>
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {isActivePaid ? "Renews" : "Status"}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
              {isActivePaid
                ? subscription.currentPeriodEnd
                  ? formatDate(subscription.currentPeriodEnd)
                  : "—"
                : "Awaiting Safepay"}
            </Typography>
          </Stack>
        </Stack>

        {/*
          * No amount is shown. What was charged is Safepay's figure, in
          * Safepay's currency, and this app has never seen it — printing our
          * catalogue price here and calling it "charged" would be a guess
          * dressed up as a receipt.
          */}
        <Typography
          variant="caption"
          sx={{ mt: 1.5, display: "block", textAlign: "center", color: "text.secondary" }}
        >
          Safepay emails your receipt with the exact amount charged.
        </Typography>
      </Box>

      {/* Only advertise unlocked features once the plan is genuinely active. */}
      {isActivePaid && (
        <Box
          sx={{
            mt: 5,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {NEXT_STEPS.map(({ icon: Icon, title, body, to, cta }) => (
            <Box
              key={title}
              sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
            >
              <Icon size={18} color={brandColors.mint} />
              <Typography sx={{ mt: 1.25, fontWeight: 800, fontSize: 15, color: "text.primary" }}>{title}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>{body}</Typography>
              <Button component={Link} to={to} size="small" sx={{ mt: 1.25, px: 0, color: brandColors.mint, fontWeight: 700 }}>
                {cta}
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 5, justifyContent: "center" }}>
        <Button component={Link} to="/dashboard/upgrade" variant="outlined" sx={{ color: "text.primary", borderColor: "divider" }}>
          Back to plans
        </Button>
        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          sx={{ bgcolor: brandColors.dark, "&:hover": { bgcolor: brandColors.primaryDark } }}
        >
          Go to dashboard
        </Button>
      </Stack>
    </UpgradeLayout>
  );
}
