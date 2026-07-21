import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/stripe/sync?session_id=cs_...
// Destino do success_url do Checkout: confirma a sessão DIRETO na API da
// Stripe (server-side) e libera o acesso na hora, sem depender do webhook —
// essencial em dev (sem stripe listen) e um fallback de robustez em produção
// (o webhook continua sendo a fonte de verdade para renovações/cancelamentos).
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const dashboardUrl = new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL);

  if (!sessionId) return NextResponse.redirect(dashboardUrl);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
  }

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
      const plan =
        priceId === process.env.STRIPE_PRICE_ID_ANNUAL ? "annual" : "monthly";
      const periodEnd = subscription.items.data[0]?.current_period_end;

      const admin = createAdminClient();
      await admin.from("subscriptions").upsert(
        {
          user_id: user.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan,
          cert_access: ["ccp", "saa"],
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        },
        { onConflict: "user_id" }
      );

      dashboardUrl.searchParams.set("checkout", "success");
    }
  } catch {
    // Sessão inválida/expirada: segue para o dashboard sem liberar nada
  }

  return NextResponse.redirect(dashboardUrl);
}
