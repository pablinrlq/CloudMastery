import "server-only";

import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

// Process-local fallback for the standalone Postgres/Better Auth runtime.
// Use a shared Redis limiter before horizontally scaling production.
const buckets = new Map<string, Bucket>();

export async function enforceRateLimit(
  route: string,
  userId: string,
  limit: number,
  windowSeconds: number
) {
  const key = `${route}:${userId}`;
  const now = Date.now();
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowSeconds * 1000 }
    : current;

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um pouco e tente novamente." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
