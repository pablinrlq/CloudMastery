"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, loginWithGoogle } from "../actions";
import { AuthShell } from "@/components/auth-shell";

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error") === "oauth";
  const passwordUpdated = searchParams.get("password") === "updated";

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
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next} />
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
        {(state?.error || oauthError) && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state?.error ?? "Não foi possível entrar com o Google. Tente novamente."}
          </p>
        )}
        {state && "code" in state && state.code === "email_unverified" && (
          <Link
            href={`/signup/confirmacao?email=${encodeURIComponent(state.email ?? "")}`}
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
