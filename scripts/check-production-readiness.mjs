import dotenv from "dotenv";
import pg from "pg";
import Stripe from "stripe";

dotenv.config({ path: ".env.local", quiet: true });

const checks = [];
const pass = (name, detail) => checks.push({ ok: true, name, detail });
const fail = (name, detail) => checks.push({ ok: false, name, detail });

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID_MONTHLY",
  "STRIPE_PRICE_ID_ANNUAL",
  "NEXT_PUBLIC_SITE_URL",
];
const missing = required.filter((name) => !process.env[name]);
missing.length ? fail("Variáveis", `Ausentes: ${missing.join(", ")}`) : pass("Variáveis", "Todas presentes");

let site;
try {
  site = new URL(
    process.env.CLOUDMASTERY_READINESS_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  );
  if (site.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(site.hostname)) {
    throw new Error("A origem pública precisa usar HTTPS e não pode ser local.");
  }
  pass("URL pública", site.origin);
} catch (error) {
  fail("URL pública", error instanceof Error ? error.message : "URL inválida");
}

if (!missing.length && site) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const liveMode = process.env.STRIPE_SECRET_KEY.startsWith("sk_live_");
    const allowSandbox = process.env.CLOUDMASTERY_ALLOW_STRIPE_TEST_MODE === "1";
    if (liveMode || allowSandbox) {
      pass("Modo Stripe", liveMode ? "Live" : "Sandbox autorizado para QA");
    } else {
      fail("Modo Stripe", "Chave sandbox detectada; troque para sk_live_ antes de vender.");
    }

    const [account, monthly, annual, endpoints] = await Promise.all([
      stripe.accounts.retrieve(),
      stripe.prices.retrieve(process.env.STRIPE_PRICE_ID_MONTHLY),
      stripe.prices.retrieve(process.env.STRIPE_PRICE_ID_ANNUAL),
      stripe.webhookEndpoints.list({ limit: 100 }),
    ]);
    if (!liveMode || account.charges_enabled) pass("Conta Stripe", "Cobranças habilitadas para o modo atual");
    else fail("Conta Stripe", "charges_enabled=false");

    const pricesValid =
      monthly.active &&
      annual.active &&
      monthly.livemode === liveMode &&
      annual.livemode === liveMode &&
      monthly.recurring?.interval === "month" &&
      annual.recurring?.interval === "year";
    pricesValid ? pass("Preços Stripe", "Mensal e anual ativos e compatíveis") : fail("Preços Stripe", "Preço inativo, intervalo incorreto ou modo divergente");

    const expectedEvents = [
      "checkout.session.completed",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ];
    const endpoint = endpoints.data.find(
      (item) => item.url === `${site.origin}/api/stripe/webhook` && item.status === "enabled"
    );
    const webhookValid = endpoint && expectedEvents.every((event) => endpoint.enabled_events.includes(event));
    webhookValid ? pass("Webhook Stripe", "Ativo com todos os eventos obrigatórios") : fail("Webhook Stripe", "Endpoint ou eventos obrigatórios ausentes");
  } catch (error) {
    fail("Stripe", error instanceof Error ? error.message : "Falha desconhecida");
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    });
    const settings = await response.json();
    response.ok && settings.mailer_autoconfirm === false
      ? pass("Confirmação de email", "Obrigatória")
      : fail("Confirmação de email", "Autoconfirmação habilitada ou configuração indisponível");
  } catch (error) {
    fail("Supabase Auth", error instanceof Error ? error.message : "Falha desconhecida");
  }

  const database = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await database.connect();
    const migrations = await database.query("select filename from public.cloudmastery_migrations order by filename desc limit 1");
    migrations.rows[0]?.filename === "0021_subscription_expiry_gate.sql"
      ? pass("Migrations", "Schema atualizado até 0021")
      : fail("Migrations", `Última migration: ${migrations.rows[0]?.filename ?? "nenhuma"}`);
    const rls = await database.query(`select count(*)::int as enabled
      from pg_tables
      where schemaname = 'public'
        and tablename = any($1::text[])
        and rowsecurity`, [["subscriptions", "user_progress", "questions", "simulado_attempts", "flashcards", "user_flashcard_progress"]]);
    rls.rows[0].enabled === 6
      ? pass("RLS", "Ativo em todas as tabelas privadas")
      : fail("RLS", `${rls.rows[0].enabled}/6 tabelas protegidas`);
  } catch (error) {
    fail("Banco", error instanceof Error ? error.message : "Falha desconhecida");
  } finally {
    await database.end().catch(() => undefined);
  }

  try {
    const response = await fetch(`${site.origin}/api/health`, { cache: "no-store" });
    response.ok ? pass("Produção", "Health check respondeu 200") : fail("Produção", `Health check respondeu ${response.status}`);
  } catch (error) {
    fail("Produção", error instanceof Error ? error.message : "Falha desconhecida");
  }
}

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"}  ${check.name}: ${check.detail}`);
}
const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  console.error(`\nReadiness reprovada: ${failures.length} bloqueio(s).`);
  process.exit(1);
}
console.log("\nReadiness aprovada.");
