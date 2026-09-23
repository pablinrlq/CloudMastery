import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getApiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";
import { hasVerifiedEmail } from "@/lib/auth/security";
import { isCheckoutPlan } from "@/lib/security";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST -> returns URL for the Stripe customer portal (manage/cancel plan).
export async function POST() {
  const user = await getApiUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!hasVerifiedEmail(user)) {
    return NextResponse.json(
      { error: "Confirme seu email para gerenciar a assinatura." },
      { status: 403 }
    );
  }

  const subscription = await db.selectFrom("subscriptions").select(["stripe_customer_id", "plan"]).where("user_id", "=", user.id).executeTakeFirst();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
  }
  if (!isCheckoutPlan(subscription.plan)) {
    return NextResponse.json(
      { error: "Este acesso não possui cobrança no Stripe para gerenciar." },
      { status: 403 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: siteUrl("/dashboard").toString(),
  });

  return NextResponse.json({ url: session.url });
}
