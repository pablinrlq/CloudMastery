import type { User } from "@supabase/supabase-js";

export function hasVerifiedEmail(user: User | null): boolean {
  return Boolean(user?.email_confirmed_at);
}

export function confirmationPath(email?: string | null) {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  const query = params.toString();
  return `/signup/confirmacao${query ? `?${query}` : ""}`;
}
