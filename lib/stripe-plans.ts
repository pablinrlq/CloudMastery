import "server-only";
import { resolveCheckoutPlan, type CheckoutPlan } from "@/lib/security";

export const CERT_ACCESS_FOR_PLAN = ["ccp", "saa", "aif"] as const;

export function getPriceId(plan: CheckoutPlan): string {
  const priceId =
    plan === "annual"
      ? process.env.STRIPE_PRICE_ID_ANNUAL
      : process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    throw new Error(`Preço Stripe não configurado para o plano ${plan}.`);
  }
  return priceId;
}

export function getPlanFromPriceId(priceId: string | undefined): CheckoutPlan | null {
  return resolveCheckoutPlan(
    priceId,
    process.env.STRIPE_PRICE_ID_MONTHLY,
    process.env.STRIPE_PRICE_ID_ANNUAL
  );
}
