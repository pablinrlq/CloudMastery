// Vercel preview builds only (runs from `prebuild`): when the Preview
// environment opts in by setting DEMO_PASSWORD, apply the migrations to its test
// database and recreate the demo accounts (see seed-demo.mjs), so the preview
// can be logged into right away. Does nothing in local builds, in production or
// in previews without DEMO_PASSWORD. Never point the Preview DATABASE_URL at the
// production database while DEMO_PASSWORD is set.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.VERCEL_ENV !== "preview" || !process.env.DEMO_PASSWORD) process.exit(0);

// The migration runner holds a session-level advisory lock, so prefer the
// direct (non-pooled) connection when the provider exposes one, as Neon does.
const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[preview-setup] DEMO_PASSWORD está definida, mas falta DATABASE_URL no ambiente Preview da Vercel.");
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const env = { ...process.env, DATABASE_URL: databaseUrl };
console.log("[preview-setup] Aplicando migrations e recriando as contas de teste do preview…");
execFileSync(process.execPath, [path.join(dir, "run-migrations.mjs")], { stdio: "inherit", env });
execFileSync(process.execPath, [path.join(dir, "seed-demo.mjs"), "--remote"], { stdio: "inherit", env });
