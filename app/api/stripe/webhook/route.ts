import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { CERT_ACCESS_FOR_PLAN, getPlanFromPriceId } from "@/lib/stripe-plans";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook indisponível" }, { status: 503 });
  }
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (subscription.metadata?.supabase_user_id !== userId) {
        throw new Error("Identidade inconsistente na assinatura Stripe.");
      }
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer.id;
      await upsertSubscription(admin, userId, subscription, customerId);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (!userId) break;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      await upsertSubscription(admin, userId, subscription, customerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  subscription: Stripe.Subscription,
  customerId: string
) {
  const item = subscription.items.data[0];
  const plan = getPlanFromPriceId(item?.price.id);
  if (!plan) throw new Error("Preço Stripe não reconhecido.");
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan,
      cert_access: isActive ? [...CERT_ACCESS_FOR_PLAN] : [],
      current_period_end: item?.current_period_end
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`Falha ao persistir assinatura: ${error.message}`);
}
