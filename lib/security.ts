export const CHECKOUT_PLANS = ["monthly", "annual"] as const;

export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlan(value: unknown): value is CheckoutPlan {
  return typeof value === "string" && CHECKOUT_PLANS.includes(value as CheckoutPlan);
}

export function resolveCheckoutPlan(
  priceId: string | undefined,
  monthlyPriceId: string | undefined,
  annualPriceId: string | undefined
): CheckoutPlan | null {
  if (priceId && monthlyPriceId && priceId === monthlyPriceId) return "monthly";
  if (priceId && annualPriceId && priceId === annualPriceId) return "annual";
  return null;
}

export function normalizeSiteOrigin(value: string | undefined): URL {
  if (!value) throw new Error("URL pública não configurada.");

  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("URL pública inválida.");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

export function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    normalized.startsWith("127.")
  );
}

// Only same-site paths are accepted. This blocks protocol-relative URLs,
// backslashes and control characters used in open-redirect bypasses.
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return fallback;
  }

  return value;
}
