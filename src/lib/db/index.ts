import "server-only";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "@/generated/kysely/types";

const globalDb = globalThis as typeof globalThis & {
  cloudMasteryPool?: Pool;
  cloudMasteryDb?: Kysely<Database>;
};

function postgresConnection() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return {};

  const url = new URL(raw);
  // change url pg when in PROD mode
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (!local) return { connectionString: raw };

  // The stock Docker Postgres image does not enable TLS. Some copied URLs
  // retain `ssl=true`, so normalize loopback connections automatically.
  url.searchParams.delete("ssl");
  url.searchParams.delete("sslmode");
  return { connectionString: url.toString(), ssl: false as const };
}

export const pool = globalDb.cloudMasteryPool ?? new Pool({
  ...postgresConnection(),
});

export const db = globalDb.cloudMasteryDb ?? new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});


if (process.env.NODE_ENV !== "production") {
  globalDb.cloudMasteryPool = pool;
  globalDb.cloudMasteryDb = db;
}
