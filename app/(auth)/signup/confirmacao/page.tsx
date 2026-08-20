import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function SignupConfirmationPage() {
  return (
    <AuthShell
      eyebrow="Só falta um passo"
      title="Confira sua caixa de entrada."
      description="Enviamos um link de confirmação para validar seu email e proteger sua conta."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.28)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl" aria-hidden>
          ✉
        </div>
        <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-950">Email enviado com sucesso</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Clique no link recebido. Depois da confirmação, você poderá entrar e escolher sua trilha.
        </p>
        <Link href="/login" className="cm-button-primary mt-6 w-full">
          Ir para o login
        </Link>
      </div>
    </AuthShell>
  );
}
