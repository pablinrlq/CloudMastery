import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/(auth)/actions";
import { DesktopAppNav, MobileAppNav } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa] pb-20 dark:bg-[#070a10] lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f7f8fa]/[0.85] backdrop-blur-xl dark:border-white/10 dark:bg-[#070a10]/[0.85]">
        <nav className="cm-container flex h-[72px] items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo size={32} href="/dashboard" />
            <DesktopAppNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200/70 bg-white/60 py-5 text-center text-xs text-slate-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-600">
        CloudMastery — material de estudo independente, sem afiliação com a AWS.
      </footer>
      <MobileAppNav />
    </div>
  );
}
