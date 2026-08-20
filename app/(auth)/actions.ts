"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security";
import { siteUrl } from "@/lib/site-url";
import { confirmationPath, hasVerifiedEmail } from "@/lib/auth-security";

export type AuthFormState =
  | {
      error?: string;
      success?: string;
      code?: "email_unverified";
      email?: string;
    }
  | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));

  if (!email || !password) return { error: "Preencha email e senha." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: "Confirme seu email antes de entrar.",
        code: "email_unverified",
        email,
      };
    }
    return { error: "Email ou senha inválidos." };
  }

  if (!hasVerifiedEmail(data.user)) {
    await supabase.auth.signOut();
    return {
      error: "Confirme seu email antes de entrar.",
      code: "email_unverified",
      email,
    };
  }

  redirect(next);
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Informe um email válido." };
  }

  if (password.length < 8) {
    return { error: "A senha precisa ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: siteUrl("/auth/callback").toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(confirmationPath(email));
}

export async function resendConfirmation(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Informe o email usado no cadastro." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: siteUrl("/auth/callback?next=/dashboard").toString(),
    },
  });

  if (error?.code === "over_email_send_rate_limit") {
    return { error: "Aguarde alguns minutos antes de solicitar outro email." };
  }

  if (error) {
    return { error: "Não foi possível reenviar agora. Tente novamente em instantes." };
  }

  return {
    success:
      "Se o cadastro existir, um novo link de confirmação será enviado. Confira também o spam.",
  };
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Informe um email válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl("/auth/callback?next=/redefinir-senha").toString(),
  });

  if (error?.code === "over_email_send_rate_limit") {
    return { error: "Aguarde alguns minutos antes de tentar novamente." };
  }

  if (error) {
    return { error: "Não foi possível enviar o link agora. Tente novamente." };
  }

  return {
    success:
      "Se houver uma conta com esse email, enviaremos um link para redefinir a senha.",
  };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");

  if (password.length < 8) {
    return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  }
  if (password !== confirmation) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Este link expirou. Solicite uma nova recuperação de senha." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Não foi possível atualizar a senha. Solicite um novo link." };
  }

  await supabase.auth.signOut();
  redirect("/login?password=updated");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: siteUrl("/auth/callback").toString(),
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
