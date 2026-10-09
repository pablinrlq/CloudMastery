import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/(auth)/actions";
import { AccountMenu, MobileCertTabs, MobileTabBar, SidebarNav } from "@/components/app-nav";
import { ProgressRing } from "@/components/progress-ring";
import { ArrowRightIcon, BoltIcon, CheckCircleIcon, FlameIcon, LogoutIcon, SparkIcon } from "@/components/ui-icons";
import { getWorkspaceSummary, type WorkspaceSummary } from "@/lib/learning/workspace";


export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const summary = await getWorkspaceSummary();

  return (
    <div className={`cm-workspace`}>
      <div className="ws-backdrop" aria-hidden="true" />
      <a
        href="#conteudo"
        className="sr-only z-[80] rounded-xl bg-ws-ink px-4 py-2 text-sm font-semibold text-ws-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>

      <aside className="ws-sidebar hidden flex-col lg:flex">
        <div className="px-5 pt-5">
          <Logo size={32} dark href="/dashboard" />
        </div>
        <div className="px-3 pt-5">
          <PlayerCard summary={summary} />
        </div>
        <div className="ws-scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-7">
          <SidebarNav certs={summary.certs} premium={summary.premium} />
        </div>
        <div className="space-y-2.5 border-t border-white/[0.07] px-3 pb-3 pt-3">
          {summary.premium ? (
            <div className="flex items-center justify-between gap-2 px-1.5">
              <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate">{summary.planLabel}</span>
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sair da conta"
                  title="Sair da conta"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  <LogoutIcon className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <UpgradeCard />
          )}
          <ThemeToggle variant="segmented" />
          {!summary.premium ? (
            <form action={logout}>
              <button type="submit" className="flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white">
                <LogoutIcon className="h-4 w-4" />
                Sair da conta
              </button>
            </form>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-[18.5rem]">
        <header className="ws-topbar sticky top-0 z-40 lg:hidden">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Logo size={28} href="/dashboard" />
            <AccountMenu
              initials={summary.initials}
              name={summary.name}
              email={summary.email}
              planLabel={summary.planLabel}
              streakDays={summary.profile ? summary.profile.streakDays : null}
            />
          </div>
          <MobileCertTabs certs={summary.certs} />
        </header>

        <main id="conteudo" className="flex-1">
          {children}
        </main>

        <footer className="px-5 pb-32 pt-8 text-center text-xs text-ws-subtle lg:pb-8">
          CloudMastery · material de estudo independente, sem afiliação com a AWS.
        </footer>
      </div>

      <MobileTabBar certs={summary.certs} />
    </div>
  );
}

function PlayerCard({ summary }: { summary: WorkspaceSummary }) {
  const { profile } = summary;
  const avatar = (
    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-[12px] font-bold text-[#1a0d03] shadow-[inset_0_1px_0_rgba(255,255,255,.45)]">
      {summary.initials}
    </span>
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
      <div className="flex items-center gap-3">
        {profile ? (
          <ProgressRing
            id="player-level"
            size={44}
            rings={[{ value: profile.progressToNext, tone: "accent", width: 3 }]}
            glass
            label={`${profile.progressToNext}% até o próximo nível`}
          >
            {avatar}
          </ProgressRing>
        ) : (
          avatar
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{summary.name ?? "Estudante"}</p>
          <p className="truncate text-xs text-orange-300/90">{profile ? profile.level.name : "Plano gratuito"}</p>
        </div>
        {profile ? (
          <span className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400" title={`Nível ${profile.level.index + 1}`}>
            {profile.level.code}
          </span>
        ) : null}
      </div>
      {profile ? (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <span className="flex items-center gap-2 rounded-xl bg-black/20 px-2.5 py-2">
            <FlameIcon className={`h-4 w-4 ${profile.streakDays > 0 ? "text-orange-400" : "text-slate-500"}`} />
            <span className="leading-none">
              <span className="block font-mono text-sm font-semibold text-white">{profile.streakDays}</span>
              <span className="text-[10px] text-slate-500">{profile.streakDays === 1 ? "dia seguido" : "dias seguidos"}</span>
            </span>
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-black/20 px-2.5 py-2">
            <BoltIcon className="h-4 w-4 text-amber-300" />
            <span className="leading-none">
              <span className="block font-mono text-sm font-semibold text-white">{profile.totalXp.toLocaleString("pt-BR")}</span>
              <span className="text-[10px] text-slate-500">XP total</span>
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function UpgradeCard() {
  return (
    <Link
      href="/pricing"
      className="group block rounded-2xl border border-orange-400/25 bg-gradient-to-br from-orange-500/[0.18] via-orange-500/[0.07] to-transparent p-3.5 transition-colors hover:border-orange-400/45"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <SparkIcon className="h-4 w-4 text-orange-300" />
        Seja Premium
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-400">Trilhas completas, simulados ilimitados e análise por domínio.</p>
      <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-orange-300">
        Ver planos
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
