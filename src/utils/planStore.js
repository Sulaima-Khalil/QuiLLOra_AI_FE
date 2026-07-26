import api, { unwrap } from "./apiClient";

/**
 * Subscription state, owned by the server.
 *
 * This used to keep the plan in localStorage, which meant a user could grant
 * themselves Business by editing one key in devtools. The plan now comes from
 * `GET /billing/subscription` and is only ever changed by the API; nothing
 * here writes a plan to storage, and nothing cached is treated as proof of
 * payment.
 *
 * The arrays below are presentation copy — feature bullets and button labels.
 * Prices are display defaults only: the server's catalogue overwrites them as
 * soon as it loads, and the server never trusts a price from this file.
 */

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

/**
 * What we assume before the server answers: the free plan.
 *
 * Deliberately the least privileged state. If the request fails we show
 * Starter, never the last plan someone happened to have cached.
 */
const FREE_SUBSCRIPTION = Object.freeze({
  planId: "starter",
  cycle: "monthly",
  status: "active",
  startedAt: null,
  currentPeriodEnd: null,
  pendingPlanId: null,
  pendingCycle: null,
  pendingSince: null,
  provider: null,
});

export const planById = (id) => PLANS.find((plan) => plan.id === id) ?? PLANS[0];

/** Per-month price for a plan on a given cycle. */
export const priceFor = (plan, cycle) => plan.price[cycle] ?? 0;

/** What the card is actually charged: 12x the monthly-equivalent on yearly. */
export const chargeFor = (plan, cycle) =>
  cycle === "yearly" ? priceFor(plan, "yearly") * 12 : priceFor(plan, "monthly");

/** Yearly saving against paying monthly for a year. */
export const savingFor = (plan) => plan.price.monthly * 12 - plan.price.yearly * 12;

const emit = () => window.dispatchEvent(new Event(CHANGE_EVENT));

/* ---------------------------------------------------------------------------
 * Server-owned state
 *
 * `snapshot` is a cache of the last server answer so components can read
 * synchronously during render. It is not authority — every mutation round
 * trips and replaces it with whatever the server says came back.
 * ------------------------------------------------------------------------ */

let snapshot = { ...FREE_SUBSCRIPTION };
let loaded = false;
let paymentConfigured = false;
let inFlight = null;

export const getSubscription = () => snapshot;

export const isSubscriptionLoaded = () => loaded;

/** Whether the backend has a payment provider wired up. Server-reported. */
export const isPaymentConfigured = () => paymentConfigured;

const applySubscription = (next) => {
  snapshot = { ...FREE_SUBSCRIPTION, ...(next ?? {}) };
  loaded = true;
  emit();
  return snapshot;
};

/** Loads the caller's plan. Concurrent callers share one request. */
export const fetchSubscription = async () => {
  if (inFlight) return inFlight;

  inFlight = api
    .get("/billing/subscription")
    .then((response) => {
      const data = unwrap(response) ?? {};
      paymentConfigured = Boolean(data.paymentConfigured);
      return applySubscription(data.subscription);
    })
    .catch((error) => {
      // Signed out, or the API is unreachable. Fall back to the free plan
      // rather than leaving a stale paid plan on screen.
      applySubscription(null);
      throw error;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/** Server plan catalogue — the prices that are actually charged. */
export const fetchPlans = async () => {
  const data = unwrap(await api.get("/billing/plans")) ?? {};
  paymentConfigured = Boolean(data.paymentConfigured);
  return data.plans ?? [];
};

/**
 * Asks the server to move this account onto a paid plan.
 *
 * Returns what the server decided, including `paymentConfigured`. It does not
 * mean the plan changed — with no provider integrated the server records the
 * request and grants nothing, and the caller must render that honestly.
 */
export const requestUpgrade = async ({ planId, cycle }) => {
  // Only the plan and cycle are sent. Prices come from the server; anything
  // this client claimed about money would be ignored anyway.
  const response = await api.post("/billing/subscription/request", { planId, cycle });
  const data = response?.data?.data ?? {};

  applySubscription(data.subscription);
  paymentConfigured = Boolean(data.paymentConfigured);

  return {
    subscription: snapshot,
    paymentConfigured,
    amountDue: data.amountDue,
    currency: data.currency,
    message: response?.data?.message,
  };
};

/**
 * Opens a Safepay checkout and returns where to send the browser.
 *
 * Only the plan id and cycle are sent. What it costs is written on the
 * Safepay plan the server maps that pair to — there is no amount in this
 * request, and there would be nowhere for one to land if there were.
 *
 * The response is not a purchase and this function never treats it as one:
 * nothing is written to storage, and the subscription it returns is the
 * unchanged one the user still has. The plan changes when Safepay tells the
 * server it has, and not a moment sooner.
 */
export const createCheckout = async ({ planId, cycle }) => {
  const data = unwrap(await api.post("/billing/checkout", { planId, cycle })) ?? {};

  // Keep the local copy in step: the server has recorded a pending intent.
  if (data.subscription) applySubscription(data.subscription);

  return { checkoutUrl: data.checkoutUrl ?? null };
};

/** Returns the account to the free plan. */
export const cancelPlan = async () => {
  const data = unwrap(await api.post("/billing/subscription/cancel", {})) ?? {};
  return applySubscription(data.subscription);
};

/** Test seam, and used on sign-out so no plan survives into the next session. */
export const resetSubscription = () => {
  snapshot = { ...FREE_SUBSCRIPTION };
  loaded = false;
  paymentConfigured = false;
  inFlight = null;
  emit();
};

export const addCycle = (from, cycle) => {
  const date = new Date(from);
  if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const subscribeSubscription = (callback) => {
  const handler = () => callback(getSubscription());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
};
