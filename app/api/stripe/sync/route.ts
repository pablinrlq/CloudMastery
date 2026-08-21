import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanFromPriceId, CERT_ACCESS_FOR_PLAN } from "@/lib/stripe-plans";
import { siteUrl } from "@/lib/site-url";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth-security";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/stripe/sync?session_id=cs_...
// Destino do success_url do Checkout: confirma a sessão DIRETO na API da
// Stripe (server-side) e libera o acesso na hora, sem depender do webhook —
// essencial em dev (sem stripe listen) e um fallback de robustez em produção
// (o webhook continua sendo a fonte de verdade para renovações/cancelamentos).
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const dashboardUrl = siteUrl("/dashboard");

  if (!sessionId) return NextResponse.redirect(dashboardUrl);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(siteUrl("/login"));
  }
  if (!hasVerifiedEmail(user)) {
    return NextResponse.redirect(siteUrl(confirmationPath(user.email)));
  }

  const rateLimited = await enforceRateLimit("stripe-sync", user.id, 20, 600);
  if (rateLimited) return rateLimited;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // A sessão precisa ser deste usuário e estar paga
    if (
      session.client_reference_id === user.id &&
      session.payment_status === "paid" &&
      session.subscription
    ) {
      const subscription = session.subscription as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const plan = getPlanFromPriceId(priceId);
      const periodEnd = subscription.items.data[0]?.current_period_end;
      const isActive = ["active", "trialing"].includes(subscription.status);
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (!plan || !isActive || !customerId) {
        return NextResponse.redirect(dashboardUrl);
      }

      const admin = createAdminClient();
      const { error } = await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan,
          cert_access: [...CERT_ACCESS_FOR_PLAN],
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        },
        { onConflict: "user_id" }
      );

      if (!error) dashboardUrl.searchParams.set("checkout", "success");
    }
  } catch {
    // Sessão inválida/expirada: segue para o dashboard sem liberar nada
  }

  return NextResponse.redirect(dashboardUrl);
}
