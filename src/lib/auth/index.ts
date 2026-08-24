import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sendAuthEmail } from "@/lib/email";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: { database: { generateId: "uuid" } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => sendAuthEmail(user.email, "Redefina sua senha — Cloud Mastery", `<p>Use o link para criar uma nova senha:</p><p><a href="${url}">Redefinir senha</a></p>`),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => sendAuthEmail(user.email, "Confirme seu email — Cloud Mastery", `<p>Confirme seu cadastro:</p><p><a href="${url}">Confirmar email</a></p>`),
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
  } : {},
  plugins: [nextCookies()],
});
