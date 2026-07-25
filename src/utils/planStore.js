import { readJSON, writeJSON } from "./storage";

/**
 * Subscription state for the upgrade flow.
 *
 * There is no billing API on the backend yet, so this keeps the selected plan
 * in localStorage and notifies subscribers on change — same event pattern as
 * profileStore, so swapping the body of these functions for real API calls
 * later won't touch any component.
 */

const STORAGE_KEY = "quillora_subscription";
const CHANGE_EVENT = "quillora-subscription-change";

/** Yearly prices are per-month equivalents, billed as 12x up front. */
export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 },
    features: [
      "5 AI writes per day",
      "3 published articles",
      "Basic SEO tools",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For serious writers & creators",
    price: { monthly: 19, yearly: 15 },
    features: [
      "Unlimited articles",
      "Unlimited AI writes",
      "Advanced SEO tools",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
    trialDays: 7,
  },
  {
    id: "business",
    name: "Business",
    tagline: "For teams & businesses",
    price: { monthly: 49, yearly: 39 },
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom domain",
      "Advanced analytics",
      "Dedicated support",
    ],
    cta: "Upgrade to Business",
    trialDays: 7,
  },
];

/** Rows for the side-by-side comparison table. `true` renders a check. */
export const COMPARISON = [
  { group: "Writing", label: "AI writes", starter: "5 / day", pro: "Unlimited", business: "Unlimited" },
  { group: "Writing", label: "Published articles", starter: "3", pro: "Unlimited", business: "Unlimited" },
  { group: "Writing", label: "Draft revision history", starter: "7 days", pro: "90 days", business: "Unlimited" },
  { group: "Writing", label: "Tone & style presets", starter: false, pro: true, business: true },
  { group: "Optimisation", label: "Basic SEO tools", starter: true, pro: true, business: true },
  { group: "Optimisation", label: "Advanced SEO & keywords", starter: false, pro: true, business: true },
  { group: "Optimisation", label: "Readability scoring", starter: false, pro: true, business: true },
  { group: "Insights", label: "Analytics dashboard", starter: false, pro: true, business: true },
  { group: "Insights", label: "Audience & funnel reports", starter: false, pro: false, business: true },
  { group: "Insights", label: "Data export (CSV)", starter: false, pro: true, business: true },
  { group: "Team", label: "Team seats", starter: "1", pro: "3", business: "Unlimited" },
  { group: "Team", label: "Roles & permissions", starter: false, pro: false, business: true },
  { group: "Team", label: "Custom domain", starter: false, pro: false, business: true },
  { group: "Support", label: "Community support", starter: true, pro: true, business: true },
  { group: "Support", label: "Priority email support", starter: false, pro: true, business: true },
  { group: "Support", label: "Dedicated success manager", starter: false, pro: false, business: true },
];

const DEFAULT_SUBSCRIPTION = {
  planId: "starter",
  cycle: "monthly",
  status: "active",
  startedAt: null,
  renewsAt: null,
  card: null,
};

export const planById = (id) => PLANS.find((plan) => plan.id === id) ?? PLANS[0];

/** Per-month price for a plan on a given cycle. */
export const priceFor = (plan, cycle) => plan.price[cycle] ?? 0;

/** What the card is actually charged: 12x the monthly-equivalent on yearly. */
export const chargeFor = (plan, cycle) =>
  cycle === "yearly" ? priceFor(plan, "yearly") * 12 : priceFor(plan, "monthly");

/** Yearly saving against paying monthly for a year. */
export const savingFor = (plan) => plan.price.monthly * 12 - plan.price.yearly * 12;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

export const getSubscription = () => readJSON(STORAGE_KEY, DEFAULT_SUBSCRIPTION);

export const addCycle = (from, cycle) => {
  const date = new Date(from);
  if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Commits a plan change. Replace the body with a POST once billing exists. */
export const activatePlan = ({ planId, cycle, card }) => {
  const now = new Date();
  const next = {
    planId,
    cycle,
    status: "active",
    startedAt: now.toISOString(),
    renewsAt: addCycle(now, cycle).toISOString(),
    card: card ?? null,
  };

  writeJSON(STORAGE_KEY, next);
  emit();

  return next;
};

export const cancelPlan = () => {
  const next = { ...getSubscription(), status: "cancelled" };
  writeJSON(STORAGE_KEY, next);
  emit();
  return next;
};

export const subscribeSubscription = (callback) => {
  const handler = () => callback(getSubscription());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
