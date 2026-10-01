import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_MONTHLY",
    "STRIPE_PRICE_ID_ANNUAL",
    "NEXT_PUBLIC_SITE_URL",
  ];
  const configurationReady = required.every((name) => Boolean(process.env[name]));

  let databaseReady = false;
  try {
    await db.selectFrom("certifications").select("id").limit(1).execute();
    databaseReady = true;
  } catch {
    databaseReady = false;
  }

  const healthy = configurationReady && databaseReady;
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { configuration: configurationReady, database: databaseReady },
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
