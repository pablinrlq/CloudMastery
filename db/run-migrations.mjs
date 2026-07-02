// Roda as migrations de db/migrations/ em ordem contra o banco do Supabase.
// Uso: node db/run-migrations.mjs
// Requer DATABASE_URL no .env.local (connection string "Session pooler" do Supabase).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não encontrada no .env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const dir = path.join(root, "db", "migrations");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await client.connect();

for (const file of files) {
  const sql = fs.readFileSync(path.join(dir, file), "utf-8");
  process.stdout.write(`Aplicando ${file}... `);
  try {
    await client.query(sql);
    console.log("ok");
  } catch (err) {
    // Re-execuções: tabelas já existentes são esperadas; qualquer outro erro para o processo.
    if (err.code === "42P07") {
      console.log("já aplicada (tabelas existem), pulando");
    } else {
      console.log("ERRO");
      console.error(`  ${err.message}`);
      process.exit(1);
    }
  }
}

const { rows } = await client.query(
  `select (select count(*) from certifications) as certs,
          (select count(*) from modules) as modules,
          (select count(*) from questions) as questions,
          (select count(*) from flashcards) as flashcards`
);
console.log(
  `\nVerificação: ${rows[0].certs} certificações, ${rows[0].modules} módulos, ${rows[0].questions} questões, ${rows[0].flashcards} flashcards.`
);

await client.end();
