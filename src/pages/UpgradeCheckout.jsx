import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  TextField,
  Divider,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import UpgradeLayout from "@/components/upgrade/UpgradeLayout";
import { planById, priceFor, chargeFor, activatePlan, addCycle, formatDate } from "@/utils/planStore";

const COUNTRIES = ["Pakistan", "United States", "United Kingdom", "Canada", "Australia", "Germany", "India"];

const TAX_RATE = 0.05;

/** 4242424242424242 -> "4242 4242 4242 4242" */
const formatCardNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

/** 1226 -> "12/26", clamping the month to 01-12 as the user types. */
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const validate = ({ cardName, cardNumber, expiry, cvc }) => {
  const errors = {};
  const digits = cardNumber.replace(/\s/g, "");

  if (!cardName.trim()) errors.cardName = "Name on card is required";
  if (digits.length !== 16) errors.cardNumber = "Enter the 16 digits on your card";

  const [month, year] = expiry.split("/");
  if (!month || !year || year.length !== 2) {
    errors.expiry = "Use MM/YY";
  } else if (Number(month) < 1 || Number(month) > 12) {
    errors.expiry = "Month must be 01-12";
  } else {
    const expiryDate = new Date(2000 + Number(year), Number(month), 0);
    if (expiryDate < new Date()) errors.expiry = "Card has expired";
  }

  if (cvc.length < 3) errors.cvc = "3 or 4 digits";

  return errors;
};

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
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    country: "Pakistan",
    postal: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const plan = state?.planId ? planById(state.planId) : null;
  const cycle = state?.cycle === "yearly" ? "yearly" : "monthly";

  const totals = useMemo(() => {
    if (!plan) return null;
    const subtotal = chargeFor(plan, cycle);
    const listPrice = plan.price.monthly * (cycle === "yearly" ? 12 : 1);
    const discount = listPrice - subtotal;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { subtotal, listPrice, discount, tax, total: subtotal + tax };
  }, [plan, cycle]);

  // Reached directly by URL with no plan chosen — send them back to pick one.
  if (!plan || plan.id === "starter") {
    return <Navigate to="/dashboard/upgrade" replace />;
  }

  const setField = (key) => (event) => {
    const raw = event.target.value;
    const value =
      key === "cardNumber" ? formatCardNumber(raw)
      : key === "expiry" ? formatExpiry(raw)
      : key === "cvc" ? raw.replace(/\D/g, "").slice(0, 4)
      : raw;

    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);

    // Stands in for the payment-provider round trip.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    activatePlan({
      planId: plan.id,
      cycle,
      card: {
        brand: "Visa",
        last4: form.cardNumber.replace(/\s/g, "").slice(-4),
        expiry: form.expiry,
        name: form.cardName,
      },
    });

    navigate("/dashboard/upgrade/success", { replace: true, state: { planId: plan.id, cycle } });
  };

  const renewsAt = formatDate(addCycle(new Date(), cycle));
  const fieldSx = { "& .MuiOutlinedInput-root": { bgcolor: brandColors.bgSecondary } };

  return (
    <UpgradeLayout maxWidth={980}>
      <Button
        component={Link}
        to="/dashboard/upgrade"
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 2, px: 0, color: "text.secondary", "&:hover": { bgcolor: "transparent", color: "text.primary" } }}
      >
        Back to plans
      </Button>

      <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" } }}>
        Confirm your upgrade
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.75, color: "text.secondary" }}>
        You won't be charged until your {plan.trialDays}-day free trial ends on {renewsAt}.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.35fr 1fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Payment details */}
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <CreditCard size={18} color={brandColors.mint} />
            <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16 }}>
              Payment details
            </Typography>
          </Stack>

          <Alert
            icon={<Lock size={16} />}
            severity="info"
            sx={{
              mt: 2,
              py: 0.5,
              bgcolor: "rgba(45,212,191,0.08)",
              color: "text.secondary",
              border: `1px solid ${brandColors.border}`,
              "& .MuiAlert-icon": { color: brandColors.mint },
            }}
          >
            Demo checkout — no card is charged. Try 4242 4242 4242 4242.
          </Alert>

          <Stack spacing={2} sx={{ mt: 2.5 }}>
            <TextField
              label="Name on card"
              value={form.cardName}
              onChange={setField("cardName")}
              error={Boolean(errors.cardName)}
              helperText={errors.cardName}
              fullWidth
              size="small"
              sx={fieldSx}
            />

            <TextField
              label="Card number"
              value={form.cardNumber}
              onChange={setField("cardNumber")}
              error={Boolean(errors.cardNumber)}
              helperText={errors.cardNumber}
              placeholder="4242 4242 4242 4242"
              fullWidth
              size="small"
              slotProps={{ input: { inputMode: "numeric" } }}
              sx={fieldSx}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Expiry"
                value={form.expiry}
                onChange={setField("expiry")}
                error={Boolean(errors.expiry)}
                helperText={errors.expiry}
                placeholder="MM/YY"
                fullWidth
                size="small"
                slotProps={{ input: { inputMode: "numeric" } }}
                sx={fieldSx}
              />
              <TextField
                label="CVC"
                value={form.cvc}
                onChange={setField("cvc")}
                error={Boolean(errors.cvc)}
                helperText={errors.cvc}
                placeholder="123"
                fullWidth
                size="small"
                slotProps={{ input: { inputMode: "numeric" } }}
                sx={fieldSx}
              />
            </Stack>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.8, color: "text.secondary" }}>
              BILLING ADDRESS
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Country"
                value={form.country}
                onChange={setField("country")}
                fullWidth
                size="small"
                sx={fieldSx}
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Postal code"
                value={form.postal}
                onChange={setField("postal")}
                fullWidth
                size="small"
                sx={fieldSx}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Order summary */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: brandColors.primary,
            bgcolor: brandColors.dark,
            position: { md: "sticky" },
            top: { md: 88 },
          }}
        >
          <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16 }}>
            Order summary
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
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
            ${priceFor(plan, cycle)}/month · renews {renewsAt}
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
                  Yearly discount (20%)
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 13.5, fontWeight: 700, color: brandColors.mint }}>
                  -${totals.discount}
                </Typography>
              </Stack>
            )}
            <SummaryRow label={`Tax (${TAX_RATE * 100}%)`} value={`$${totals.tax.toFixed(2)}`} muted />

            <Divider sx={{ my: 0.5 }} />

            <SummaryRow label="Due today" value="$0.00" strong />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Then ${totals.total.toFixed(2)} on {renewsAt}, {cycle === "yearly" ? "yearly" : "monthly"}.
            </Typography>
          </Stack>

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
            startIcon={submitting ? null : <Lock size={15} />}
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
                <span>Processing…</span>
              </Stack>
            ) : (
              `Start ${plan.trialDays}-day free trial`
            )}
          </Button>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={13} color={brandColors.outline} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
              Secured with 256-bit encryption
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ mt: 1.5, display: "block", textAlign: "center", color: "text.secondary", fontSize: 11 }}>
            By upgrading you agree to our Terms. Cancel anytime before {renewsAt} and you won't be charged.
          </Typography>
        </Box>
      </Box>
    </UpgradeLayout>
  );
}
