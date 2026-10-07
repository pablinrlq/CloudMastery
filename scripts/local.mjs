// One command to run CloudMastery on your machine: `npm run local`.
// Installs dependencies if needed, creates .env.local on the first run, starts
// the Postgres from docker-compose.yml when it isn't running, applies the
// migrations, recreates the demo accounts and starts `next dev`.
// It only ever touches a database on this machine: with a remote DATABASE_URL
// in .env.local it just starts the dev server.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const LOCAL_DATABASE_URL = "postgresql://postgres:1234@localhost:5433/cloudmastery";

const step = (message) => console.log(`\n▸ ${message}`);
function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}
// npm is a .cmd shim on Windows and needs a shell; node and docker don't.
function run(command, args, { shell = false } = {}) {
  return spawnSync(command, args, { cwd: root, stdio: "inherit", shell }).status === 0;
}
const node = (script) => run(process.execPath, [path.join(root, script)]);

if (!fs.existsSync(path.join(root, "node_modules", "next"))) {
  step("Instalando as dependências (npm install)…");
  if (!run("npm", ["install"], { shell: process.platform === "win32" })) fail("O npm install falhou (veja o erro acima).");
}

if (!fs.existsSync(envPath)) {
  const demoPassword = `Teste-${randomBytes(12).toString("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 10)}`;
  fs.writeFileSync(
    envPath,
    [
      "# Criado por `npm run local`: banco no Docker e contas de teste nesta máquina.",
      `DATABASE_URL=${LOCAL_DATABASE_URL}`,
      "DATABASE_SSL=disable",
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`,
      "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
      `DEMO_PASSWORD=${demoPassword}`,
      "",
    ].join("\n")
  );
  step("Criei o .env.local (banco local e senha das contas de teste).");
}

const { default: dotenv } = await import("dotenv");
dotenv.config({ path: envPath, quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) fail("Defina DATABASE_URL no .env.local.");
const host = new URL(databaseUrl).hostname;

if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) {
  const { default: pg } = await import("pg");
  const reachable = async () => {
    const client = new pg.Client({ connectionString: databaseUrl, ssl: false, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      return true;
    } catch {
      return false;
    } finally {
      await client.end().catch(() => undefined);
    }
  };

  if (!(await reachable())) {
    step("Subindo o Postgres no Docker (docker compose up -d)…");
    if (!run("docker", ["compose", "up", "-d", "db"])) {
      fail(
        "Não consegui subir o banco. Instale e abra o Docker Desktop " +
          "(https://www.docker.com/products/docker-desktop/) e rode `npm run local` de novo."
      );
    }
    let ready = false;
    for (let attempt = 0; attempt < 60 && !ready; attempt++) {
      ready = await reachable();
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!ready) fail("O Postgres do Docker não respondeu em 60 s. Veja `docker compose logs db`.");
  }

  step("Aplicando as migrations…");
  if (!node("db/run-migrations.mjs")) fail("As migrations falharam (veja o erro acima).");
  step("Criando as contas de teste…");
  if (!node("db/seed-demo.mjs")) fail("Não consegui criar as contas de teste (veja o erro acima).");

  console.log(
    [
      "",
      "────────────────────────────────────────────",
      "  CloudMastery: http://localhost:3000/login",
      "  Premium:  premium@cloudmastery.test",
      "  Grátis:   gratis@cloudmastery.test",
      `  Senha:    ${process.env.DEMO_PASSWORD || "a impressa acima"}`,
      "────────────────────────────────────────────",
      "",
    ].join("\n")
  );
} else {
  step(`DATABASE_URL aponta para ${host}: banco remoto não é alterado por este comando. Subindo só o site.`);
}

const dev = spawn(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev"], {
  cwd: root,
  stdio: "inherit",
});
dev.on("exit", (code) => process.exit(code ?? 0));
