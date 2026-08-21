import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth-security";

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

function redirectWithRefreshedCookies(url: URL, source: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  const contentSecurityPolicy = source.headers.get("Content-Security-Policy");
  if (contentSecurityPolicy) {
    redirectResponse.headers.set("Content-Security-Policy", contentSecurityPolicy);
  }
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDevelopment = process.env.NODE_ENV === "development";
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.stripe.com https://vitals.vercel-insights.com",
    "frame-src https://*.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.stripe.com",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  const nextResponse = () => {
    const next = NextResponse.next({ request: { headers: requestHeaders } });
    next.headers.set("Content-Security-Policy", contentSecurityPolicy);
    return next;
  };
  let response = nextResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = nextResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return redirectWithRefreshedCookies(redirectUrl, response);
  }

  if (isProtected && !hasVerifiedEmail(user)) {
    const redirectUrl = new URL(confirmationPath(user?.email), request.url);
    return redirectWithRefreshedCookies(redirectUrl, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
