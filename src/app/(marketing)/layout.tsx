import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/dal";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const creden = await getSession();

  return (
    <div className="cm-public flex min-h-screen flex-col bg-white">
      <SiteHeader loggedIn={!!creden} />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-[#080b12] py-14">
        <div className="cm-container">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div className="max-w-xs">
              <Logo dark size={30} href={null} />
              <p className="mt-4 text-sm leading-6 text-slate-500">
                O caminho mais direto para a sua certificação AWS — em
                português, com método e dados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
              <div>
                <p className="font-semibold text-white">Certificações</p>
                <ul className="mt-4 space-y-2.5 text-slate-500">
                  <li>Cloud Practitioner</li>
                  <li>Solutions Architect</li>
                  <li>AI Practitioner</li>
                  <li className="text-slate-700">Developer (em breve)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Plataforma</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <Link
                      href="/pricing"
                      className="text-slate-500 transition hover:text-white"
                    >
                      Planos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-slate-500 transition hover:text-white"
                    >
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-slate-500 transition hover:text-white"
                    >
                      Criar conta
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-5 text-slate-600">
            AWS e os nomes das certificações são marcas da Amazon Web Services,
            Inc. A CloudMastery é um material de estudo independente, sem
            afiliação com a AWS.
          </p>
        </div>
      </footer>
    </div>
  );
}
