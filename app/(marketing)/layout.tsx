import Link from "next/link";
import { Logo, LogoIcon } from "@/components/logo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo dark size={32} />
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition hover:text-white"
            >
              Planos
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/40"
            >
              Começar grátis
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-gray-950 py-12">
        <div className="mx-auto max-w-6xl px-4">
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
              <p className="mt-3 text-sm text-gray-400">
                O caminho mais direto para a sua certificação AWS — em português,
                com método e dados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 text-sm">
              <div>
                <p className="font-semibold text-white">Certificações</p>
                <ul className="mt-3 space-y-2 text-gray-400">
                  <li>Cloud Practitioner</li>
                  <li>Solutions Architect</li>
                  <li className="text-gray-600">Developer (em breve)</li>
                  <li className="text-gray-600">SysOps (em breve)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Plataforma</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link href="/pricing" className="text-gray-400 hover:text-white">
                      Planos
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-gray-400 hover:text-white">
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="text-gray-400 hover:text-white">
                      Criar conta
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-xs text-gray-500">
            AWS e os nomes das certificações são marcas da Amazon Web Services, Inc.
            A CloudMastery é um material de estudo independente, sem afiliação com a AWS.
          </p>
        </div>
      </footer>
    </div>
  );
}
