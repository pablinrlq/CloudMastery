import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { activityCalendar, longestStreak } from "@/lib/learning/study-format";
import { computeXp, LEVELS, levelFor, type Level } from "@/lib/learning/levels";

export { LEVELS, type Level };

// XP é DERIVADO dos dados existentes (progresso + simulados), sem tabela nova:
// evita dupla contagem e mantém o número sempre consistente com o histórico.
const ACTIVITY_DAYS = 16 * 7; // janela do mapa de consistência

export type GamificationProfile = {
  totalXp: number;
  level: Level;
  nextLevel: { name: string; code: string } | null;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressToNext: number; // 0-100
  streakDays: number;
  studiedToday: boolean;
  modulesCompleted: number;
  simuladosCompleted: number;
  bestScore: number | null;
  longestStreak: number;
  /** Atividades por dia (UTC) nas últimas 16 semanas, do mais antigo ao mais recente. */
  activity: Array<{ date: string; count: number }>;
};

// Streak = dias consecutivos com atividade, terminando hoje ou ontem.
function computeStreak(dates: string[]): { streak: number; today: boolean } {
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  if (days.size === 0) return { streak: 0, today: false };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const studiedToday = days.has(todayStr);

  // Âncora: se estudou hoje começa em hoje, senão em ontem (mantém o streak vivo por 1 dia de folga)
  const cursor = studiedToday ? todayStr : days.has(yStr) ? yStr : null;
  if (!cursor) return { streak: 0, today: false };

  let streak = 0;
  const d = new Date(cursor + "T00:00:00Z");
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return { streak, today: studiedToday };
}

// Cached per request: the workspace shell and the dashboard share one read.
export const getGamificationProfile = cache(async (): Promise<GamificationProfile> => {
  const { userId } = await verifySession();
  const [progress, attempts] = await Promise.all([
    db.selectFrom("user_progress").select(["status", "last_visited_at"]).where("user_id", "=", userId).where("status", "=", "completed").execute(),
    db.selectFrom("simulado_attempts").select(["score", "mode", "completed_at"]).where("user_id", "=", userId).where("completed_at", "is not", null).execute(),
  ]);

  const completedModules = progress;
  const completedAttempts = attempts;
  const fullAttempts = completedAttempts.filter((a) => a.mode === "full");

  const modulesCompleted = completedModules.length;
  const simuladosCompleted = fullAttempts.length;
  const bestScore = completedAttempts.length
    ? Math.max(...completedAttempts.map((a) => Number(a.score) || 0))
    : null;

  const totalXp = computeXp({ modulesCompleted, fullScores: fullAttempts.map((a) => Number(a.score)) });

  const level = levelFor(totalXp);
  const xpIntoLevel = totalXp - level.minXp;
  const xpForNextLevel = level.nextXp !== null ? level.nextXp - level.minXp : null;
  const progressToNext =
    xpForNextLevel !== null ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;

  const activityDates = [
    ...completedModules.map((m) => m.last_visited_at).filter(Boolean),
    ...completedAttempts.map((a) => a.completed_at).filter(Boolean),
  ].map((value) => new Date(value!).toISOString());
  const { streak, today } = computeStreak(activityDates);

  return {
    totalXp,
    level,
    nextLevel: LEVELS[level.index + 1] ? { name: LEVELS[level.index + 1].name, code: LEVELS[level.index + 1].code } : null,
    xpIntoLevel,
    xpForNextLevel,
    progressToNext,
    streakDays: streak,
    studiedToday: today,
    modulesCompleted,
    simuladosCompleted,
    bestScore,
    longestStreak: longestStreak(activityDates),
    activity: activityCalendar(activityDates, ACTIVITY_DAYS),
  };
});
