import "server-only";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retry_after: number;
};

export async function enforceRateLimit(
  route: string,
  userId: string,
  limit: number,
  windowSeconds: number
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("consume_api_rate_limit", {
    p_bucket_key: `${route}:${userId}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  // Fail closed: a database outage must not turn into an unlimited expensive API.
  if (error) {
    console.error("rate_limit_unavailable", { route, code: error.code });
    return NextResponse.json(
      { error: "Serviço temporariamente indisponível." },
      { status: 503, headers: { "Retry-After": "30" } }
    );
  }

  const result = (Array.isArray(data) ? data[0] : data) as RateLimitResult | null;
  if (!result?.allowed) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um pouco e tente novamente." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result?.retry_after ?? windowSeconds),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
