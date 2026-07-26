import { useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import UpgradeLayout from "@/components/upgrade/UpgradeLayout";
import { planById, priceFor, chargeFor, createCheckout } from "@/utils/planStore";

/**
 * Review, then hand off to Safepay.
 *
 * This page once collected a card number, expiry and CVC into plain React
 * state and then wrote "you are on Business" to localStorage. Nothing was
 * charged and nothing was verified. The card fields are gone rather than
 * relabelled — card details are Safepay's to collect on their own domain, and
 * taking them here would put this app in PCI scope for no benefit.
 *
 * What this page does now is one round trip: ask the server for a checkout
 * URL, then navigate to it. It never writes a plan anywhere. Coming back from
 * Safepay proves nothing either; only the webhook does.
 */

const SummaryRow = ({ label, value, muted, strong }) => (
  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
    <Typography
      variant="body2"
      sx={{ fontSize: 13.5, color: muted ? "text.secondary" : "text.primary", fontWeight: strong ? 700 : 400 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontSize: strong ? 15 : 13.5, fontWeight: strong ? 800 : 600, color: "text.primary" }}
    >
      {value}
    </Typography>
  </Stack>
);

export default function UpgradeCheckout() {
  const { state } = useLocation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const plan = state?.planId ? planById(state.planId) : null;
  const cycle = state?.cycle === "yearly" ? "yearly" : "monthly";

  const totals = useMemo(() => {
    if (!plan) return null;
    const subtotal = chargeFor(plan, cycle);
    const listPrice = plan.price.monthly * (cycle === "yearly" ? 12 : 1);
    return { subtotal, listPrice, discount: listPrice - subtotal };
  }, [plan, cycle]);

  // Reached directly by URL with no plan chosen — send them back to pick one.
  if (!plan || plan.id === "starter") {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");

    try {
      // Only the plan id and cycle travel; the server resolves the rest.
      const { checkoutUrl } = await createCheckout({ planId: plan.id, cycle });

      if (!checkoutUrl) throw new Error("No checkout URL");

      /*
       * A full navigation, not a router push: the destination is Safepay's
       * own domain. `replace` keeps the checkout page out of history, so Back
       * from Safepay returns to the plan list rather than re-submitting.
       *
       * `submitting` is deliberately left true — the button must not come
       * back to life underneath a navigation that is already happening.
       */
      window.location.replace(checkoutUrl);
    } catch (requestError) {
      setSubmitting(false);
      setError(
        requestError?.response?.data?.message ||
          "We couldn't start checkout. Please try again.",
      );
    }
  };

  return (
    <UpgradeLayout maxWidth={640}>
      <Button
        component={Link}
        to="/dashboard/upgrade"
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 2, px: 0, color: "text.secondary", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
      >
        Back to plans
      </Button>

      <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" } }}>
        Confirm your plan
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>
        Review your plan, then continue to Safepay to pay.
      </Typography>

      <Box
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: brandColors.primary,
          bgcolor: brandColors.dark,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: "text.primary" }}>
            {plan.name}
          </Typography>
          <Chip
            label={cycle === "yearly" ? "Yearly" : "Monthly"}
            size="small"
            sx={{ bgcolor: "rgba(45,212,191,0.15)", color: brandColors.mint, fontWeight: 700, fontSize: 10.5 }}
          />
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          ${priceFor(plan, cycle)}/month
        </Typography>

        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <SummaryRow
            label={cycle === "yearly" ? "12 months" : "1 month"}
            value={`$${totals.listPrice}`}
            muted
          />
          {totals.discount > 0 && (
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontSize: 13.5, color: brandColors.mint }}>
                Yearly discount
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 13.5, fontWeight: 700, color: brandColors.mint }}>
                -${totals.discount}
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 0.5 }} />

          <SummaryRow label="Plan total" value={`$${totals.subtotal}`} strong />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Safepay shows the exact amount and currency you&apos;ll be charged before
            you confirm.
          </Typography>
        </Stack>

        {/* The one thing this page must not imply is that money has moved. */}
        <Alert
          icon={<Info size={16} />}
          severity="info"
          sx={{
            mt: 2.5,
            py: 0.5,
            bgcolor: "rgba(45,212,191,0.08)",
            color: "text.secondary",
            border: `1px solid ${brandColors.border}`,
            "& .MuiAlert-icon": { color: brandColors.mint },
          }}
        >
          You&apos;ll continue to Safepay to pay. Please use the email address on
          this account — it&apos;s how your payment is matched back to you. Your plan
          changes once Safepay confirms the payment to us, not when you return.
        </Alert>

        {error && (
          <Alert severity="error" variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          onClick={handleConfirm}
          disabled={submitting}
          sx={{
            mt: 3,
            py: 1.25,
            fontWeight: 800,
            bgcolor: brandColors.mint,
            color: brandColors.dark,
            "&:hover": { bgcolor: brandColors.secondary },
            "&.Mui-disabled": { bgcolor: "rgba(45,212,191,0.4)", color: brandColors.dark },
          }}
        >
          {submitting ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={16} sx={{ color: brandColors.dark }} />
              <span>Redirecting to Safepay…</span>
            </Stack>
          ) : (
            `Continue to payment`
          )}
        </Button>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={13} color={brandColors.outline} />
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
            Card details are entered on Safepay, never here
          </Typography>
        </Stack>
      </Box>
    </UpgradeLayout>
  );
}
