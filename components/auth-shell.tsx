import Link from "next/link";
import { Logo, LogoIcon } from "@/components/logo";

const platformStats = [
  ["3", "trilhas completas"],
  ["89", "módulos"],
  ["162", "questões"],
];

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
    <main className="cm-public grid min-h-screen bg-[#f4f6f9] lg:grid-cols-[minmax(0,1.08fr)_minmax(500px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#080c13] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="cm-auth-grid absolute inset-0" />
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-orange-500/16 blur-[115px]" />
        <div className="pointer-events-none absolute -right-32 -top-28 h-[460px] w-[460px] rounded-full bg-indigo-500/10 blur-[135px]" />

        <div className="relative">
          <Logo dark size={38} />
        </div>

        <div className="relative max-w-xl pb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3.5 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_14px_#fb923c]" />
            Preparação orientada por dados
          </span>
          <h2 className="mt-7 max-w-lg text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-white xl:text-6xl">
            Menos dúvida.
            <span className="block bg-gradient-to-r from-orange-300 to-amber-200 bg-clip-text text-transparent">Mais domínio.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Transforme cada hora de estudo em progresso mensurável até a sua certificação AWS.
          </p>

          <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-2 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.75)] backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/[0.07] bg-black/15 p-4">
              <LogoIcon size={40} />
              <div>
                <p className="text-sm font-bold text-white">Seu estudo, com uma próxima ação clara</p>
                <p className="mt-1 text-xs text-slate-500">Trilha → prática → diagnóstico → aprovação</p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-white/10 px-2 py-5">
              {platformStats.map(([value, label]) => (
                <div key={label} className="px-3 text-center">
                  <p className="text-2xl font-extrabold tracking-[-0.04em] text-white">{value}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-600">Conhecimento que vira confiança.</p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-orange-200/35 blur-[100px]" />
        <div className="relative w-full max-w-[460px] rounded-[1.75rem] border border-white/90 bg-white/90 p-6 shadow-[0_34px_90px_-52px_rgba(15,23,42,0.45)] backdrop-blur sm:p-9 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="mb-9 flex justify-center lg:hidden">
            <Logo size={38} />
          </div>

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30"
          >
            <span aria-hidden>←</span> Voltar para o início
          </Link>

          <p className="cm-kicker">{eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-[2.75rem]">{title}</h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-600">{description}</p>

          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-center text-sm text-slate-500">{footer}</div> : null}

          <p className="mt-9 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-400">
            Ambiente seguro · Seus dados são protegidos e nunca compartilhados.
          </p>
        </div>
      </section>
    </main>
  );
}
