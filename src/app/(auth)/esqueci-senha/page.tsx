"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { requestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthShell
      eyebrow="Recuperação segura"
      title="Redefina sua senha."
      description="Informe o email da conta e enviaremos um link de uso único para você voltar aos estudos."
      footer={
        <Link href="/login" className="cm-link">
          Voltar para o login
        </Link>
      }
    >
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-700">
            Email da conta
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
          {pending ? "Enviando link…" : "Enviar link de recuperação"}
        </button>
      </form>
    </AuthShell>
  );
}
