"use client";

import { useActionState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { updatePassword } from "../actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <AuthShell
      eyebrow="Nova credencial"
      title="Crie uma nova senha."
      description="Escolha uma senha exclusiva para a Cloud Mastery e mantenha sua conta protegida."
    >
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-700">
            Nova senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            className="cm-input"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirmation" className="mb-2 block text-sm font-bold text-slate-700">
            Confirme a nova senha
          </label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            className="cm-input"
          />
        </div>

        {state?.error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="cm-button-primary w-full">
          {pending ? "Atualizando senha…" : "Salvar nova senha"}
        </button>
      </form>
    </AuthShell>
  );
}
