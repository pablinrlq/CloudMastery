import "server-only";
import Stripe from "stripe";

// Instanciação preguiçosa via Proxy: o cliente Stripe só é criado no primeiro
// uso (runtime), nunca durante a coleta de páginas do build. Assim o build não
// exige STRIPE_SECRET_KEY, mas os handlers de API continuam usando `stripe.*`
// exatamente como antes.
let client: Stripe | null = null;

function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY não configurada no ambiente.");
    }
    client = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return client;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const value = getStripe()[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(getStripe()) : value;
  },
});
