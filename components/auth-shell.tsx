import Link from "next/link";
import { Logo } from "@/components/logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="cm-public grid min-h-screen bg-[#f7f8fa] lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-[#090d15] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="cm-auth-grid absolute inset-0" />
        <div className="pointer-events-none absolute -left-36 top-1/3 h-80 w-80 rounded-full bg-orange-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 -top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

        <div className="relative">
          <Logo dark size={36} />
        </div>

        <div className="relative max-w-xl pb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_14px_#fb923c]" />
            Preparação orientada por dados
          </span>
          <h2 className="mt-7 max-w-lg text-5xl font-bold leading-[1.05] tracking-[-0.05em] text-white xl:text-6xl">
            Menos dúvida.
            <span className="block text-slate-500">Mais domínio.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Transforme cada hora de estudo em progresso mensurável até a sua certificação AWS.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl">
            {[
              ["46", "módulos"],
              ["130+", "questões"],
              ["9", "labs práticos"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`px-5 py-5 ${index > 0 ? "border-l border-white/10" : ""}`}
              >
                <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          CloudMastery · conhecimento que vira confiança
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 flex justify-center lg:hidden">
            <Logo size={36} />
          </div>

          <Link
            href="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <span aria-hidden>←</span> Voltar para o início
          </Link>

          <p className="cm-kicker">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600">{description}</p>

          <div className="mt-9">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}

          <p className="mt-10 text-center text-xs leading-5 text-slate-400">
            Ambiente seguro · Seus dados são protegidos e nunca compartilhados.
          </p>
        </div>
      </section>
    </main>
  );
}
