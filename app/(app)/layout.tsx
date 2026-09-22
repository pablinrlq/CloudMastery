import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/(auth)/actions";
import { DesktopAppNav, MobileAppNav } from "@/components/app-nav";
import { LogoutIcon } from "@/components/ui-icons";
import "./workspace.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cm-workspace min-h-screen pb-20 lg:grid lg:grid-cols-[272px_minmax(0,1fr)] lg:pb-0">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-white/10 bg-[#0a0f18] px-4 py-5 text-white shadow-[18px_0_45px_-34px_rgba(2,6,23,.75)] lg:flex">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_40%_-10%,rgba(249,115,22,.26),transparent_65%)]" />
        <div className="px-2">
          <Logo size={34} dark href="/dashboard" />
        </div>
        <div className="relative mt-9 flex min-h-0 flex-1 flex-col">
          <DesktopAppNav />
        </div>
        <div className="relative border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-500">Aparência</span>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30">
              <LogoutIcon className="h-[18px] w-[18px]" />
              Sair da conta
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#080c13]/80 lg:hidden">
        <nav className="flex h-16 items-center justify-between px-5 sm:px-6">
          <Logo size={30} href="/dashboard" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Sair da conta"
              >
                <LogoutIcon className="h-[18px] w-[18px]" />
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="min-h-[calc(100vh-9rem)]">{children}</main>
      <footer className="border-t border-slate-200/70 bg-white/40 px-5 py-5 text-center text-xs text-slate-400 dark:border-white/10 dark:bg-white/[0.01] dark:text-slate-600">
        CloudMastery — material de estudo independente, sem afiliação com a AWS.
      </footer>
      <MobileAppNav />
      </div>
    </div>
  );
}
