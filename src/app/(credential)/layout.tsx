import Link from "next/link";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/dal";


// Public credential pages (shared on LinkedIn) use the workspace design system
// so a recruiter sees the same product quality as the student.
export default async function CredentialLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className={`cm-workspace flex min-h-screen flex-col`}>
      <div className="ws-backdrop" aria-hidden="true" />
      <header className="relative z-10">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-8">
          <Logo size={30} href="/" />
          <nav aria-label="Conta" className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard" className="ws-btn ws-btn-secondary ws-btn-sm whitespace-nowrap">
                Ir para o painel
              </Link>
            ) : (
              <>
                <Link href="/login" className="ws-btn ws-btn-ghost ws-btn-sm hidden whitespace-nowrap sm:inline-flex">
                  Entrar
                </Link>
                <Link href="/signup" className="ws-btn ws-btn-primary ws-btn-sm whitespace-nowrap">
                  Criar conta<span className="ml-[0.28em] hidden sm:inline">grátis</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="conteudo" className="relative flex-1">
        {children}
      </main>
      <footer className="relative px-5 pb-10 pt-8 text-center text-xs text-ws-subtle">
        CloudMastery · material de estudo independente, sem afiliação com a AWS.
      </footer>
    </div>
  );
}
