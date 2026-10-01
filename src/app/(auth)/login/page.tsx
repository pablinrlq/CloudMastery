"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, loginWithGithub, loginWithGoogle } from "../actions";
import { AuthShell } from "@/components/auth-shell";

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
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
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
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-700"
            >
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
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {state?.error ??
              "Não foi possível entrar com email Social. Tente novamente."}
          </p>
        )}
        {state?.code === "email_unverified" && state.email && (
          <Link
            href={`/signup/confirmacao?email=${encodeURIComponent(state.email)}`}
            className="cm-button-secondary w-full"
          >
            Reenviar confirmação
          </Link>
        )}
        {passwordUpdated && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
          >
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

      <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> ou{" "}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={loginWithGoogle}>
        <button type="submit" className="cm-button-secondary w-full gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-800 shadow-sm">
            G
          </span>
          Continuar com Google
        </button>
      </form>
      <form action={loginWithGithub} style={{ marginTop: "10px" }}>
        <button type="submit" className="cm-button-secondary w-full gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.97 10.97 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
            </svg>
          </span>
          Continuar com GitHub
        </button>
      </form>
    </AuthShell>
  );
}
