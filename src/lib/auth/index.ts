import "server-only";
import "dotenv/config"
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sendAuthEmail } from "@/lib/email";
import { emailVerificationTemplate, passwordResetTemplate } from "@/lib/email-templates";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  advanced: { database: { generateId: "uuid" } },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const email = passwordResetTemplate(url);
      await sendAuthEmail(user.email, email.subject, email.html);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const email = emailVerificationTemplate(url);
      await sendAuthEmail(user.email, email.subject, email.html);
    },
  },
  socialProviders: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
    google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ["user:email", "read:user"],
      mapProfileToUser: (profile) => {
        const email = profile.email ?? `${profile.id}+${profile.login}@users.noreply.github.com`;
        return {
          email,
          emailVerified: !profile.email ? true : false, // se caiu no fallback, já marca como "verificado" pra não tentar mandar email pra endereço fake
        };
      },
    }
  } : {},
  plugins: [nextCookies()],
});
