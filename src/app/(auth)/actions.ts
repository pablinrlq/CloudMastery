"use server";

import "dotenv/config"

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/security";
import { siteUrl } from "@/lib/site-url";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth/security";

export type AuthFormState = { error?: string; success?: string; code?: "email_unverified"; email?: string } | undefined;

export async function login(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));
  if (!email || !password) return { error: "Preencha email e senha." };
  try {
    const result = await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
    if (!hasVerifiedEmail(result.user)) return { error: "Confirme seu email antes de entrar.", code: "email_unverified", email };
  } catch {
    return { error: "Email ou senha inválidos." };
  }
  redirect(next);
}

export async function signup(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@")) return { error: "Informe um email válido." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  try {
    await auth.api.signUpEmail({ body: { name: email.split("@")[0], email, password, callbackURL: siteUrl("/dashboard").toString() }, headers: await headers() });
  } catch {
    return { error: "Não foi possível criar a conta. Talvez este email já esteja em uso." };
  }
  redirect(confirmationPath(email));
}

export async function resendConfirmation(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Informe o email usado no cadastro." };
  try {
    await auth.api.sendVerificationEmail({ body: { email, callbackURL: siteUrl("/dashboard").toString() }, headers: await headers() });
  } catch {
    return { error: "Não foi possível reenviar agora. Tente novamente em instantes." };
  }

  return { success: "Se o cadastro existir, um novo link de confirmação será enviado. Confira também o spam." };
}

export async function requestPasswordReset(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Informe um email válido." };
  try {
    await auth.api.requestPasswordReset({ body: { email, redirectTo: siteUrl("/redefinir-senha").toString() }, headers: await headers() });
  } catch {
    return { error: "Não foi possível enviar o link agora. Tente novamente." };
  }
  return { success: "Se houver uma conta com esse email, enviaremos um link para redefinir a senha." };
}

export async function updatePassword(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  const token = String(formData.get("token") ?? "");
  if (password.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirmation) return { error: "As senhas não coincidem." };
  if (!token) return { error: "Este link expirou. Solicite uma nova recuperação de senha." };

  try {
    await auth.api.resetPassword({ body: { newPassword: password, token } });
  }
  catch {
    return { error: "Não foi possível atualizar a senha. Solicite um novo link." };
  }
  redirect("/login?password=updated");
}

export async function loginWithGoogle() {
  let result;

  console.log(process.env.GOOGLE_CLIENT_ID ?? "oi")

  try {
    result = await auth.api.signInSocial({
      body:
      {
        provider: "google",
        callbackURL: siteUrl("/dashboard").toString()
      }, headers: await headers()
    });
  }
  catch (err) {
    console.log(err)
    redirect("/login?error=oauth");
  }

  if (!result.url) redirect("/login?error=oauth");
  redirect(result.url);
}

export async function loginWithGithub() {
  let result;


  try {
    result = await auth.api.signInSocial({
      body: {
        provider: "github",
        callbackURL: siteUrl("/dashboard").toString()
      },
      headers: await headers()
    })
  } catch (err) {
    console.log(err)
    redirect("/login?error=oauth");
  }

  if (!result.url) redirect("/login?error=oauth");
  redirect(result.url);
}

export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
