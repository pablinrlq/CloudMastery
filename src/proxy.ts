import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Renamed from `middleware.ts` in Next.js 16. Runs on every matched request:
// refreshes the Supabase session cookie and does an optimistic redirect for
// signed-out users hitting protected areas. Subscription-tier access (which
// cert a user paid for) is NOT checked here — that requires a DB read and is
// enforced in the DAL/page (see lib/dal.ts) to keep this check cookie-only.
const protectedPrefixes = [
  "/dashboard",
  "/course",
  "/simulado",
  "/flashcards",
  "/certificado",
];

export function proxy(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !getSessionCookie(request)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
