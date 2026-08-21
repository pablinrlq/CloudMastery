// Transactional, concurrency-safe migration runner for local, CI and EC2.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não encontrada.");

const dir = path.join(root, "db", "migrations");
const files = fs.readdirSync(dir).filter((file) => file.endsWith(".sql")).sort();
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

await client.connect();
try {
  await client.query("select pg_advisory_lock(hashtext('cloudmastery_migrations'))");
  await client.query(`create table if not exists public.cloudmastery_migrations (
    filename text primary key,
    checksum text not null,
    applied_at timestamptz not null default now()
  )`);

  const { rows: legacy } = await client.query(
    "select to_regclass('public.certifications') is not null as initialized"
  );
  const { rows: trackedRows } = await client.query(
    "select filename from public.cloudmastery_migrations"
  );
  const tracked = new Set(trackedRows.map((row) => row.filename));

  // Production databases created before the ledger already contain 0001-0019.
  if (legacy[0].initialized && tracked.size === 0) {
    for (const file of files.filter((name) => name < "0020_")) {
      await client.query(
        "insert into public.cloudmastery_migrations(filename, checksum) values ($1, 'legacy-baseline') on conflict do nothing",
        [file]
      );
      tracked.add(file);
    }
    console.log("Migrations legadas 0001-0019 registradas como baseline.");
  }

  for (const file of files) {
    if (tracked.has(file)) {
      console.log(`Ignorando ${file} (já aplicada)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    console.log(`Aplicando ${file}...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into public.cloudmastery_migrations(filename, checksum) values ($1, $2)",
        [file, checksum]
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }

  const { rows } = await client.query(`select
    (select count(*) from certifications) as certs,
    (select count(*) from modules) as modules,
    (select count(*) from questions) as questions,
    (select count(*) from flashcards) as flashcards`);
  console.log(`Verificação: ${rows[0].certs} certificações, ${rows[0].modules} módulos, ${rows[0].questions} questões, ${rows[0].flashcards} flashcards.`);
} finally {
  await client.query("select pg_advisory_unlock(hashtext('cloudmastery_migrations'))").catch(() => undefined);
  await client.end();
}
