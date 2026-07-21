import type { GamificationProfile } from "@/lib/gamification";

// Faixa de gamificação no topo do dashboard: nível, XP, streak.
export function StatsBar({ profile }: { profile: GamificationProfile }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Nível */}
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            {profile.level.emoji}
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Nível {profile.level.index + 1}
            </p>
            <p className="text-lg font-bold">{profile.level.name}</p>
          </div>
        </div>

        {/* Streak */}
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold">
            <span className={profile.streakDays > 0 ? "" : "grayscale"}>🔥</span>
            {profile.streakDays}
          </p>
          <p className="text-xs text-gray-400">
            {profile.streakDays === 1 ? "dia seguido" : "dias seguidos"}
            {profile.studiedToday ? "" : " · estude hoje!"}
          </p>
        </div>

        {/* XP total */}
        <div className="text-center">
          <p className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-2xl font-extrabold text-transparent">
            {profile.totalXp.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-gray-400">XP total</p>
        </div>
      </div>

      {/* Barra de progresso para o próximo nível */}
      {profile.xpForNextLevel !== null ? (
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>
              {profile.xpIntoLevel} / {profile.xpForNextLevel} XP
            </span>
            <span>Próximo: {LEVEL_NAME_AT(profile.level.index + 1)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
              style={{ width: `${profile.progressToNext}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-5 text-center text-sm font-medium text-amber-300">
          👑 Você atingiu o nível máximo. Lenda da nuvem!
        </p>
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
