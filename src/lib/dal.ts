import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth/security";
import { hasAccess } from "@/lib/learning/access";

export { hasAccess } from "@/lib/learning/access";

// Secure (DB-backed) session check. Cached per request so calling it from
// multiple Server Components/pages during one render doesn't re-hit Supabase.
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;


  if (!user) {
    redirect("/login")
  }

  if (!hasVerifiedEmail(user)) {
    redirect(confirmationPath(user.email));
  }

  return { userId: user.id, email: user.email, user };
});

export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    user,
  };
});

export type Subscription = {
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused";
  plan: string | null;
  cert_access: string[];
  current_period_end: string | null;
};

export const getSubscription = cache(async (): Promise<Subscription | null> => {
  const { userId } = await verifySession();
  const row = await db.selectFrom("subscriptions")
    .select(["status", "plan", "cert_access", "current_period_end"])
    .where("user_id", "=", userId).executeTakeFirst();
  return row ? { ...row, current_period_end: row.current_period_end ? new Date(row.current_period_end).toISOString() : null } as Subscription : null;
});

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
