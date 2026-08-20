import Link from "next/link";
import { Logo, LogoIcon } from "@/components/logo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cm-public flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b12]/95 backdrop-blur-xl">
        <nav className="cm-container flex h-[72px] items-center justify-between">
          <Logo dark size={34} />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 sm:inline-flex"
            >
              Planos
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-10 items-center rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_12px_28px_rgba(249,115,22,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/25 active:translate-y-0"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#080b12] py-14">
        <div className="cm-container">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div className="max-w-xs">
              <span className="inline-flex items-center gap-2">
                <LogoIcon size={28} />
                <span className="font-bold text-white">
                  Cloud
                  <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                    Mastery
                  </span>
                </span>
              </span>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                O caminho mais direto para a sua certificação AWS — em português,
                com método e dados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
              <div>
                <p className="font-semibold text-white">Certificações</p>
                <ul className="mt-4 space-y-2.5 text-slate-500">
                  <li>Cloud Practitioner</li>
                  <li>Solutions Architect</li>
                  <li className="text-slate-700">Developer (em breve)</li>
                  <li className="text-slate-700">SysOps (em breve)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Plataforma</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link href="/pricing" className="text-slate-500 transition hover:text-white">
                      Planos
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-slate-500 transition hover:text-white">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-slate-500 transition hover:text-white">
                      Criar conta
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-5 text-slate-600">
            AWS e os nomes das certificações são marcas da Amazon Web Services, Inc.
            A CloudMastery é um material de estudo independente, sem afiliação com a AWS.
          </p>
        </div>
      </footer>
    </div>
  );
}
