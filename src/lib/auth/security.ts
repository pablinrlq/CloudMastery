type AuthUser = { emailVerified?: boolean; email?: string | null };

export function hasVerifiedEmail(user: AuthUser | null): boolean {
  return Boolean(user?.emailVerified);
}

export function confirmationPath(email?: string | null) {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  const query = params.toString();
  return `/signup/confirmacao${query ? `?${query}` : ""}`;
}
