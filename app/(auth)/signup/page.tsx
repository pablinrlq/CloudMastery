"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "../actions";
import { AuthShell } from "@/components/auth-shell";
import { passwordPolicyError } from "@/lib/password-policy";
import { createClient } from "@/lib/supabase/client";

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!email || !email.includes("@")) {
      setError("Informe um email válido.");
      return;
    }

    const passwordError = passwordPolicyError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setPending(true);
    setError(undefined);

    // Sign-up runs from the visitor's browser, so Supabase applies IP limits
    // to the actual visitor instead of pooling every Vercel request together.
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      if (signUpError.code === "over_email_send_rate_limit") {
        setError("O envio de confirmação está temporariamente indisponível. Tente novamente em alguns minutos.");
      } else if (signUpError.code === "over_request_rate_limit") {
        setError("Não foi possível concluir o cadastro agora. Tente novamente.");
      } else if (signUpError.code === "user_already_exists") {
        setError("Esta conta já existe. Entre ou recupere sua senha.");
      } else {
        setError("Não foi possível criar sua conta agora. Revise os dados e tente novamente.");
      }
      setPending(false);
      return;
    }

    router.replace(`/signup/confirmacao?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthShell
      eyebrow="Comece sua jornada"
      title="Construa sua próxima conquista."
      description="Crie sua conta e conheça uma preparação feita para transformar estudo em aprovação."
      footer={
        <>
          Já estuda com a CloudMastery?{" "}
          <Link href="/login" className="cm-link">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
            Seu melhor email
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
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">
            Crie uma senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            placeholder="Mínimo de 12 caracteres"
            className="cm-input"
          />
          <p className="mt-2 text-xs leading-5 text-slate-400">Use 12+ caracteres com maiúscula, minúscula, número e símbolo.</p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="cm-button-primary w-full"
        >
          {pending ? "Criando seu acesso…" : "Criar minha conta"}
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
