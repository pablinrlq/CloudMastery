import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_MONTHLY",
    "STRIPE_PRICE_ID_ANNUAL",
    "NEXT_PUBLIC_SITE_URL",
  ];
  const configurationReady = required.every((name) => Boolean(process.env[name]));
  let databaseReady = false;
  try {
    const { error } = await createAdminClient()
      .from("certifications")
      .select("id", { head: true, count: "exact" });
    databaseReady = !error;
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
