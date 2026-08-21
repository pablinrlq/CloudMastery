"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithGoogle } from "../actions";
import { AuthShell } from "@/components/auth-shell";
import { createClient } from "@/lib/supabase/client";
import { hasVerifiedEmail } from "@/lib/auth-security";
import { safeRedirectPath } from "@/lib/security";

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>();
  const [pending, setPending] = useState(false);
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("next"));
  const oauthError = searchParams.get("error") === "oauth";
  const passwordUpdated = searchParams.get("password") === "updated";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Preencha email e senha.");
      return;
    }

    setPending(true);
    setError(undefined);
    setUnverifiedEmail(undefined);

    // Login happens directly from the visitor's browser. This keeps Supabase's
    // IP-based Auth protection per user instead of pooling all Vercel traffic.
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.code === "email_not_confirmed") {
        setError("Confirme seu email antes de entrar.");
        setUnverifiedEmail(email);
      } else if (signInError.code === "over_request_rate_limit") {
        setError("Não foi possível concluir o login agora. Tente novamente.");
      } else {
        setError("Email ou senha inválidos.");
      }
      setPending(false);
      return;
    }

    if (!hasVerifiedEmail(data.user)) {
      await supabase.auth.signOut();
      setError("Confirme seu email antes de entrar.");
      setUnverifiedEmail(email);
      setPending(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      title="Continue sua evolução."
      description="Entre para retomar sua trilha exatamente de onde parou."
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link href="/signup" className="cm-link">
            Comece agora
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
            Seu email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@empresa.com"
            className="cm-input"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
              Senha
            </label>
            <Link href="/esqueci-senha" className="cm-link text-xs">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="cm-input"
          />
        </div>
        {(error || oauthError) && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error ?? "Não foi possível entrar com o Google. Tente novamente."}
          </p>
        )}
        {unverifiedEmail && (
          <Link
            href={`/signup/confirmacao?email=${encodeURIComponent(unverifiedEmail)}`}
            className="cm-button-secondary w-full"
          >
            Reenviar confirmação
          </Link>
        )}
        {passwordUpdated && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Senha atualizada. Entre com sua nova senha.
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="cm-button-primary w-full"
        >
          {pending ? "Entrando com segurança…" : "Entrar na plataforma"}
        </button>
      </form>

      {googleAuthEnabled && (
        <>
          <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" />
          </div>
          <form action={loginWithGoogle}>
            <button type="submit" className="cm-button-secondary w-full gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-800 shadow-sm">G</span>
              Continuar com Google
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
