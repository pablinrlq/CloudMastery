// Cria (idempotente) o produto e os preços de assinatura no Stripe (modo teste)
// e imprime os price IDs para o .env.local. Uso: node scripts/setup-stripe.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Stripe from "stripe";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_NAME = "CloudMastery — Acesso Completo";

async function main() {
  // Reaproveita o produto se já existir (execuções repetidas não duplicam)
  const existing = await stripe.products.search({
    query: `name:"${PRODUCT_NAME}" AND active:"true"`,
  });
  const product =
    existing.data[0] ??
    (await stripe.products.create({
      name: PRODUCT_NAME,
      description:
        "Trilhas CCP + SAA, simulados no formato oficial, labs, flashcards e diagnóstico de prontidão. Inclui certificações futuras.",
    }));

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
  let monthly = prices.data.find((p) => p.recurring?.interval === "month");
  let annual = prices.data.find((p) => p.recurring?.interval === "year");

  monthly ??= await stripe.prices.create({
    product: product.id,
    currency: "brl",
    unit_amount: 3900,
    recurring: { interval: "month" },
    nickname: "Mensal R$39",
  });
  annual ??= await stripe.prices.create({
    product: product.id,
    currency: "brl",
    unit_amount: 39000,
    recurring: { interval: "year" },
    nickname: "Anual R$390",
  });

  console.log("PRODUCT_ID=" + product.id);
  console.log("STRIPE_PRICE_ID_MONTHLY=" + monthly.id);
  console.log("STRIPE_PRICE_ID_ANNUAL=" + annual.id);
}

main().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(1);
});
