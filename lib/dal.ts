import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Secure (DB-backed) session check. Cached per request so calling it from
// multiple Server Components/pages during one render doesn't re-hit Supabase.
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { userId: user.id, email: user.email! };
});

export type Subscription = {
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid";
  plan: string | null;
  cert_access: string[];
  current_period_end: string | null;
};

export const getSubscription = cache(async (): Promise<Subscription | null> => {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("status, plan, cert_access, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
});

export function hasAccess(subscription: Subscription | null, certId: string) {
  if (!subscription) return false;
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const covers = subscription.cert_access.includes(certId) || subscription.cert_access.includes("all");
  return isActive && covers;
}

// Use in pages that require a paid plan for a specific certification, e.g.
// `await requireAccess("ccp")` at the top of app/(app)/course/[cert]/page.tsx.
export async function requireAccess(certId: string) {
  await verifySession();
  const subscription = await getSubscription();

  if (!hasAccess(subscription, certId)) {
    redirect(`/pricing?cert=${certId}`);
  }

  return subscription;
}
