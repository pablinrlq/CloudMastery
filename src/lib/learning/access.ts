export type Subscription = {
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused";
  plan: string | null;
  cert_access: string[];
  current_period_end: string | null;
};

export function hasAccess(subscription: Subscription | null, certId: string) {
  if (!subscription) return false;
  const active = subscription.status === "active" || subscription.status === "trialing";
  const covers = subscription.cert_access.includes(certId) || subscription.cert_access.includes("all");
  const lifetime = subscription.plan === "lifetime";
  const periodValid =
    lifetime ||
    (subscription.current_period_end !== null &&
      new Date(subscription.current_period_end).getTime() > Date.now());
  return active && covers && periodValid;
}
