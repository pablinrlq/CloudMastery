import type { GamificationProfile } from "@/lib/gamification";
import { SparkIcon, TargetIcon, TrophyIcon } from "@/components/ui-icons";

const LEVEL_NAMES = [
  "Cloud Rookie",
  "Cloud Explorer",
  "Cloud Builder",
  "Cloud Practitioner",
  "Cloud Architect",
  "Cloud Expert",
  "Cloud Master",
];

export function StatsBar({ profile }: { profile: GamificationProfile }) {
  const nextLevel = LEVEL_NAMES[profile.level.index + 1];

  return (
    <section className="study-card p-6 sm:p-8" aria-labelledby="study-profile-title">
      <div className="grid gap-7 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div className="border-b border-slate-200 pb-7 dark:border-white/10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
              <TrophyIcon />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Nível {profile.level.index + 1} · {profile.level.code}
              </p>
              <h2 id="study-profile-title" className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 dark:text-white">
                {profile.level.name}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {profile.studiedToday
                  ? "Sua sessão de hoje já está registrada. Continue construindo consistência."
                  : "Complete uma atividade hoje para manter sua sequência ativa."}
              </p>
            </div>
          </div>

          {profile.xpForNextLevel !== null ? (
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{profile.xpIntoLevel} de {profile.xpForNextLevel} XP</span>
                <span className="truncate">Próximo: {nextLevel}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300 transition-[width] duration-500" style={{ width: `${profile.progressToNext}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-7 text-sm font-semibold text-orange-600 dark:text-orange-300">Nível máximo alcançado.</p>
          )}
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-white/10">
          <Metric icon={<SparkIcon />} label="XP acumulado" value={profile.totalXp.toLocaleString("pt-BR")} />
          <Metric icon={<TargetIcon />} label="Sequência" value={`${profile.streakDays} ${profile.streakDays === 1 ? "dia" : "dias"}`} />
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-36 flex-col justify-center p-5 sm:p-7">
      <span className="text-orange-500">{icon}</span>
      <p className="mt-4 text-xs font-semibold text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
