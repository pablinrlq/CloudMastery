import Link from "next/link";
import { Logo } from "@/components/logo";

const navigation = [
  ["Método", "/#metodo"],
  ["Trilhas", "/#trilhas"],
  ["Planos", "/#planos"],
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="cm-public flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080c13]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#080c13]/78">
        <nav className="cm-container flex h-[72px] items-center justify-between" aria-label="Navegação principal">
          <div className="flex items-center gap-10">
            <Logo dark size={36} />
            <div className="hidden items-center gap-1 lg:flex">
              {navigation.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 sm:px-4"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-10 items-center rounded-xl bg-orange-500 px-3.5 text-sm font-extrabold text-[#0b1018] shadow-[0_8px_24px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_12px_28px_rgba(249,115,22,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/25 active:translate-y-0 sm:px-4"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#080c13] py-14 text-slate-400">
        <div className="cm-container">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="max-w-sm">
              <Logo dark size={34} href={null} />
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Clareza para estudar, dados para evoluir e confiança para agendar sua certificação AWS.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Certificações</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li>Cloud Practitioner</li>
                <li>Solutions Architect</li>
                <li>AI Practitioner</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Plataforma</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  ["Planos", "/#planos"],
                  ["Entrar", "/login"],
                  ["Criar conta", "/signup"],
                  ["Privacidade", "/privacy"],
                  ["Termos de uso", "/terms"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-slate-500 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} CloudMastery.</p>
            <p>AWS e as certificações são marcas da Amazon Web Services, Inc. Material independente, sem afiliação.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
