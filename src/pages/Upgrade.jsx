import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Check,
  Minus,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { brandColors } from "@/theme/muiTheme";
import UpgradeLayout from "@/components/upgrade/UpgradeLayout";
import {
  PLANS,
  COMPARISON,
  getSubscription,
  subscribeSubscription,
  planById,
  priceFor,
  savingFor,
} from "@/utils/planStore";

const PLAN_ICONS = { starter: Sparkles, pro: Zap, business: Building2 };

const FAQS = [
  {
    q: "Can I change or cancel my plan later?",
    a: "Yes. Upgrade, downgrade or cancel at any time from Settings. There are no long-term contracts and no cancellation fees.",
  },
  {
    q: "What happens to my articles if I downgrade?",
    a: "Nothing is deleted. Articles beyond your new plan's limit become read-only drafts, and everything is restored the moment you upgrade again.",
  },
  {
    q: "How does the free trial work?",
    a: "Paid plans include a 7-day trial. You are not charged until it ends, and cancelling before day 7 costs nothing.",
  },
  {
    q: "Do you offer refunds?",
    a: "If something isn't right, contact us within 14 days of a charge and we'll refund it in full.",
  },
];

/** Renders a comparison cell: boolean -> icon, string -> text. */
const ComparisonValue = ({ value }) => {
  if (value === true) return <Check size={16} color={brandColors.secondary} />;
  if (value === false) return <Minus size={16} color={brandColors.outline} />;
  return (
    <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
      {value}
    </Typography>
  );
};

const PlanCard = ({ plan, cycle, isCurrent, onSelect }) => {
  const Icon = PLAN_ICONS[plan.id];
  const price = priceFor(plan, cycle);
  const saving = savingFor(plan);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: plan.highlight ? brandColors.primary : "divider",
        bgcolor: plan.highlight ? brandColors.dark : "background.paper",
        boxShadow: plan.highlight ? 9 : "none",
        transition: "transform 0.2s, border-color 0.2s",
        "&:hover": { transform: { md: "translateY(-4px)" }, borderColor: brandColors.primary },
      }}
    >
      {plan.highlight && (
        <Chip
          label="MOST POPULAR"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: brandColors.mint,
            color: brandColors.dark,
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: 0.8,
          }}
        />
      )}

      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: plan.highlight ? "rgba(45,212,191,0.15)" : brandColors.bgSecondary,
          }}
        >
          <Icon size={17} color={brandColors.mint} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 17 }}>
            {plan.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {plan.tagline}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mt: 3, alignItems: "baseline" }}>
        <Typography sx={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: "text.primary" }}>
          ${price}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          /month
        </Typography>
      </Stack>

      <Typography variant="caption" sx={{ mt: 0.75, display: "block", color: "text.secondary", minHeight: 18 }}>
        {price === 0
          ? "Free forever"
          : cycle === "yearly"
            ? `Billed $${price * 12} yearly — save $${saving}`
            : "Billed monthly"}
      </Typography>

      <Stack spacing={1.25} sx={{ mt: 3, flex: 1 }}>
        {plan.features.map((feature) => (
          <Stack key={feature} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <Box sx={{ mt: 0.25, flexShrink: 0 }}>
              <Check size={15} color={brandColors.secondary} />
            </Box>
            <Typography variant="body2" sx={{ fontSize: 13.5, color: "text.secondary" }}>
              {feature}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Button
        fullWidth
        disabled={isCurrent}
        onClick={() => onSelect(plan)}
        variant={plan.highlight ? "contained" : "outlined"}
        sx={{
          mt: 3,
          fontWeight: 700,
          ...(plan.highlight && {
            bgcolor: brandColors.mint,
            color: brandColors.dark,
            "&:hover": { bgcolor: brandColors.secondary },
          }),
          "&.Mui-disabled": {
            color: "text.secondary",
            borderColor: "divider",
            bgcolor: "transparent",
          },
        }}
      >
        {isCurrent ? "Current plan" : plan.cta}
      </Button>

      {plan.trialDays && !isCurrent && (
        <Typography variant="caption" sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}>
          {plan.trialDays}-day free trial · cancel anytime
        </Typography>
      )}
    </Box>
  );
};

export default function Upgrade() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(getSubscription());
  const [cycle, setCycle] = useState(subscription.cycle ?? "monthly");

  useEffect(() => subscribeSubscription(setSubscription), []);

  const currentPlan = planById(subscription.planId);

  const handleSelect = (plan) => {
    navigate("/dashboard/upgrade/checkout", { state: { planId: plan.id, cycle } });
  };

  return (
    <UpgradeLayout maxWidth={1180}>
      {/* Heading */}
      <Box sx={{ textAlign: "center", maxWidth: 620, mx: "auto" }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: brandColors.mint }}
        >
          Plans & Pricing
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
          Choose the plan that fits you
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
          You're currently on <Box component="strong" sx={{ color: "text.primary" }}>{currentPlan.name}</Box>.
          Upgrade any time — changes are prorated to the day.
        </Typography>

        {/* Cycle toggle */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3, alignItems: "center", justifyContent: "center" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: cycle === "monthly" ? "text.primary" : "text.secondary" }}
          >
            Monthly
          </Typography>
          <Switch
            checked={cycle === "yearly"}
            onChange={(e) => setCycle(e.target.checked ? "yearly" : "monthly")}
            color="primary"
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: cycle === "yearly" ? "text.primary" : "text.secondary" }}
          >
            Yearly
          </Typography>
          <Chip
            label="Save 20%"
            size="small"
            sx={{ bgcolor: brandColors.mint, color: brandColors.dark, fontWeight: 700, fontSize: 11 }}
          />
        </Stack>
      </Box>

      {/* Plan cards */}
      <Box
        sx={{
          mt: 5,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2.5,
          alignItems: "stretch",
        }}
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            isCurrent={plan.id === subscription.planId && subscription.status === "active"}
            onSelect={handleSelect}
          />
        ))}
      </Box>

      {/* Trust strip */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 4 }}
        sx={{ mt: 3, py: 2, justifyContent: "center", alignItems: "center" }}
      >
        {[
          { icon: ShieldCheck, text: "Secure payments" },
          { icon: RefreshCw, text: "Cancel anytime" },
          { icon: Check, text: "14-day money-back guarantee" },
        ].map(({ icon: Icon, text }) => (
          <Stack key={text} direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Icon size={15} color={brandColors.outline} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Comparison table */}
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
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 16 }}>
            Compare all features
          </Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 620 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: brandColors.bgSecondary }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary", borderColor: "divider" }}>
                  FEATURE
                </TableCell>
                {PLANS.map((plan) => (
                  <TableCell
                    key={plan.id}
                    align="center"
                    sx={{
                      fontWeight: 800,
                      fontSize: 12.5,
                      color: plan.highlight ? brandColors.mint : "text.primary",
                      borderColor: "divider",
                      width: 140,
                    }}
                  >
                    {plan.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {COMPARISON.map((row, index) => {
                const isNewGroup = index === 0 || COMPARISON[index - 1].group !== row.group;
                return (
                  <Fragment key={row.label}>
                    {isNewGroup && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{
                            py: 1,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: 1,
                            color: brandColors.outline,
                            bgcolor: "rgba(255,255,255,0.02)",
                            borderColor: "divider",
                          }}
                        >
                          {row.group.toUpperCase()}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ "&:hover": { bgcolor: brandColors.hover } }}>
                      <TableCell sx={{ fontSize: 13.5, color: "text.secondary", borderColor: "divider" }}>
                        {row.label}
                      </TableCell>
                      {["starter", "pro", "business"].map((planId) => (
                        <TableCell key={planId} align="center" sx={{ borderColor: "divider" }}>
                          <Box sx={{ display: "grid", placeItems: "center" }}>
                            <ComparisonValue value={row[planId]} />
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* FAQ */}
      <Box sx={{ mt: 4, maxWidth: 780, mx: "auto" }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontSize: 18 }}>
          Frequently asked questions
        </Typography>
        {FAQS.map((faq) => (
          <Accordion key={faq.q} disableGutters>
            <AccordionSummary expandIcon={<ChevronDown size={18} color={brandColors.text} />}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </UpgradeLayout>
  );
}
