import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCheckoutPlan } from "@/lib/security";
import { getPriceId } from "@/lib/stripe-plans";
import { siteUrl } from "@/lib/site-url";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth-security";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST { plan: "monthly" | "annual" } -> redirects to Stripe Checkout.
// certAccess is fixed to "all" for the MVP (single plan covers CCP + SAA);
// swap for a per-cert price map if per-certification plans are added later.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "Entre na sua conta para assinar.",
        redirectTo: "/login?next=/pricing",
      },
      { status: 401 }
    );
  }
  if (!hasVerifiedEmail(user)) {
    return NextResponse.json(
      {
        error: "Confirme seu email antes de iniciar o pagamento.",
        redirectTo: confirmationPath(user.email),
      },
      { status: 403 }
    );
  }

  const rateLimited = await enforceRateLimit("stripe-checkout", user.id, 5, 600);
  if (rateLimited) return rateLimited;

  const payload: unknown = await request.json().catch(() => null);
  const plan =
    payload && typeof payload === "object" && "plan" in payload
      ? (payload as { plan?: unknown }).plan
      : undefined;
  if (!isCheckoutPlan(plan)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId = getPriceId(plan);
  } catch {
    return NextResponse.json(
      { error: "Checkout temporariamente indisponível" },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id;

  if (
    existing &&
    ["active", "trialing", "past_due", "unpaid", "paused"].includes(existing.status)
  ) {
    return NextResponse.json(
      { error: "Você já possui uma assinatura. Gerencie o pagamento pelo dashboard." },
      { status: 409 }
    );
  }

  if (!customerId) {
    const customer = await stripe.customers.create(
      {
        email: user.email,
        metadata: { supabase_user_id: user.id },
      },
      { idempotencyKey: `cloudmastery-customer-${user.id}` }
    );
    customerId = customer.id;

    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
        plan,
        cert_access: [],
      },
      { onConflict: "user_id" }
    );
    if (error) {
      return NextResponse.json(
        { error: "Não foi possível preparar sua assinatura." },
        { status: 500 }
      );
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    allow_promotion_codes: false,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: siteUrl(
      "/api/stripe/sync?session_id={CHECKOUT_SESSION_ID}"
    ).toString(),
    cancel_url: siteUrl("/pricing?checkout=cancelled").toString(),
    client_reference_id: user.id,
    metadata: { supabase_user_id: user.id, plan },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "Falha ao criar checkout" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
