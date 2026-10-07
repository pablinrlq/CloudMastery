"use client";

import { useActionState, useEffect, useState } from "react";
import { updateHolderName, type HolderNameState } from "@/app/(app)/conquistas/actions";
import { useSetHolderName } from "@/components/holder-name";
import { AlertIcon, CheckCircleIcon, PencilIcon } from "@/components/ui-icons";

export function HolderNameForm({ initialName, needsAttention }: { initialName: string; needsAttention: boolean }) {
  const [state, action, pending] = useActionState<HolderNameState, FormData>(updateHolderName, undefined);
  const [open, setOpen] = useState(needsAttention);
  // Close the form in the same render that delivers a successful save, so the
  // new name and the confirmation appear together.
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state?.success) setOpen(false);
  }
  // The action doesn't re-render the route, so anything printing the name on
  // this page (the certificate) picks it up from here.
  const setLiveName = useSetHolderName();
  useEffect(() => {
    if (state?.success && state.name) setLiveName?.(state.name);
  }, [state, setLiveName]);
  const name = state?.name ?? initialName;
  const warn = needsAttention && !state?.success && open;

  return (
    <section
      aria-labelledby="holder-name-title"
      className={`ws-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6 ${warn ? "!border-ws-warn/40 bg-ws-warn/[0.04]" : ""}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          warn ? "bg-ws-warn/15 text-ws-warn-ink" : "bg-ws-accent/10 text-ws-accent-ink"
        }`}
      >
        {warn ? <AlertIcon className="h-5 w-5" /> : <PencilIcon className="h-5 w-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <p id="holder-name-title" className="text-sm font-semibold text-ws-ink">Nome nos certificados</p>
        {open ? (
          <p className="mt-0.5 text-sm text-ws-muted">
            Use seu nome completo: ele aparece nos certificados, nas páginas públicas e no LinkedIn.
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[15px] text-ws-text">
            <span className="font-medium text-ws-ink">{name}</span>
            {state?.success ? (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-ws-success-ink">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                {state.success}
              </span>
            ) : null}
          </p>
        )}

        {open ? (
          <form action={action} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="holder-name">Nome completo</label>
            <input
              id="holder-name"
              name="name"
              defaultValue={state?.value ?? name}
              autoComplete="name"
              required
              minLength={3}
              maxLength={80}
              placeholder="Seu nome completo"
              aria-invalid={state?.error ? true : undefined}
              aria-describedby={state?.error ? "holder-name-error" : undefined}
              className="h-11 min-w-0 flex-1 rounded-xl border border-ws-line/15 bg-ws-raised px-3.5 text-[15px] text-ws-ink outline-none transition-colors placeholder:text-ws-subtle focus:border-ws-accent focus:ring-4 focus:ring-ws-accent/15"
            />
            <button type="submit" disabled={pending} className="ws-btn ws-btn-primary shrink-0">
              {pending ? "Salvando…" : "Salvar nome"}
            </button>
            {!needsAttention ? (
              <button type="button" onClick={() => setOpen(false)} disabled={pending} className="ws-btn ws-btn-ghost shrink-0">
                Cancelar
              </button>
            ) : null}
          </form>
        ) : null}
        {open && state?.error ? (
          <p id="holder-name-error" role="alert" className="mt-2 text-sm font-medium text-ws-danger-ink">{state.error}</p>
        ) : null}
      </div>

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="ws-btn ws-btn-secondary ws-btn-sm shrink-0 self-start sm:self-center">
          <PencilIcon className="h-4 w-4" />
          Editar
        </button>
      ) : null}
    </section>
  );
}
