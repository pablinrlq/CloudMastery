import type { GamificationProfile } from "@/lib/gamification";
import { LogoIcon } from "@/components/logo";

// Faixa de gamificação no topo do dashboard: nível, XP, streak.
export function StatsBar({ profile }: { profile: GamificationProfile }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-[#0d121c] p-6 text-white shadow-[0_24px_60px_-38px_rgba(15,23,42,0.7)] sm:p-8 dark:border-white/10">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-[80px]" />
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Nível */}
        <div className="flex items-center gap-4">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-inner">
            <LogoIcon size={36} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Nível {profile.level.index + 1}
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight">{profile.level.name}</p>
            <p className="mt-1 text-[10px] font-bold tracking-[0.18em] text-orange-400">{profile.level.code}</p>
          </div>
        </div>

        {/* Streak */}
        <div className="text-center">
          <p className="text-2xl font-extrabold text-white">{profile.streakDays}</p>
          <p className="mt-1 text-xs text-slate-500">
            {profile.streakDays === 1 ? "dia seguido" : "dias seguidos"}
            {profile.studiedToday ? "" : " · estude hoje!"}
          </p>
        </div>

        {/* XP total */}
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-orange-400">
            {profile.totalXp.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-xs text-slate-500">XP total</p>
        </div>
      </div>

      {/* Barra de progresso para o próximo nível */}
      {profile.xpForNextLevel !== null ? (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>
              {profile.xpIntoLevel} / {profile.xpForNextLevel} XP
            </span>
            <span>Próximo: {LEVEL_NAME_AT(profile.level.index + 1)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-all duration-500"
              style={{ width: `${profile.progressToNext}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-amber-300">
          <LogoIcon size={24} />
          Você atingiu o nível máximo. Cloud Master.
        </div>
      )}
    </div>
  );
}

// Nomes dos níveis para exibir "próximo nível" (espelha lib/gamification).
const LEVEL_NAMES = [
  "Cloud Rookie",
  "Cloud Explorer",
  "Cloud Builder",
  "Cloud Practitioner",
  "Cloud Architect",
  "Cloud Expert",
  "Cloud Master",
];
function LEVEL_NAME_AT(i: number) {
  return LEVEL_NAMES[i] ?? "—";
}
