"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LogoIcon } from "@/components/logo";
import { resendConfirmation } from "../../actions";

export default function SignupConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationForm />
    </Suspense>
  );
}

function ConfirmationForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [state, action, pending] = useActionState(resendConfirmation, undefined);

  return (
    <AuthShell
      eyebrow="Só falta um passo"
      title="Confirme seu email."
      description="A confirmação protege sua conta e é obrigatória para acessar cursos, simulados e pagamentos."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.28)]">
        <LogoIcon size={48} />
        <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-950">
          Verifique sua caixa de entrada
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Abra o link enviado pela Cloud Mastery. Se não encontrar, confira o spam ou solicite um novo envio abaixo.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="confirmation-email" className="mb-2 block text-sm font-bold text-slate-700">
              Email do cadastro
            </label>
            <input
              id="confirmation-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              placeholder="voce@empresa.com"
              className="cm-input"
            />
          </div>

          {state?.error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {state.success}
            </p>
          )}

          <button type="submit" disabled={pending} className="cm-button-primary w-full">
            {pending ? "Solicitando novo envio…" : "Reenviar email de confirmação"}
          </button>
        </form>

        <Link href="/login" className="cm-button-secondary mt-3 w-full">
          Voltar para o login
        </Link>
      </div>
    </AuthShell>
  );
}
