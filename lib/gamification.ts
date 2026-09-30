import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { activityCalendar, longestStreak } from "@/lib/study-format";

// XP é DERIVADO dos dados existentes (progresso + simulados), sem tabela nova:
// evita dupla contagem e mantém o número sempre consistente com o histórico.
const XP_PER_MODULE = 50;
const XP_PER_FULL_SIMULADO = 100;
const XP_PASS_BONUS = 50; // simulado completo com nota >= corte
const PASS_SCORE = 72;
const ACTIVITY_DAYS = 16 * 7; // janela do mapa de consistência

export type Level = {
  index: number;
  name: string;
  code: string;
  minXp: number;
  nextXp: number | null; // null = nível máximo
};

export const LEVELS: Array<Omit<Level, "index" | "nextXp">> = [
  { name: "Cloud Rookie", code: "CM-01", minXp: 0 },
  { name: "Cloud Explorer", code: "CM-02", minXp: 200 },
  { name: "Cloud Builder", code: "CM-03", minXp: 500 },
  { name: "Cloud Practitioner", code: "CM-04", minXp: 1000 },
  { name: "Cloud Architect", code: "CM-05", minXp: 1800 },
  { name: "Cloud Expert", code: "CM-06", minXp: 3000 },
  { name: "Cloud Master", code: "CM-07", minXp: 4500 },
];

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

function levelFor(xp: number): Level {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) {
    if (xp >= LEVELS[k].minXp) i = k;
  }
  const base = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  return { index: i, name: base.name, code: base.code, minXp: base.minXp, nextXp: next?.minXp ?? null };
}

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
  const supabase = await createClient();

  const [{ data: progress }, { data: attempts }] = await Promise.all([
    supabase
      .from("user_progress")
      .select("status, last_visited_at")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("simulado_attempts")
      .select("score, mode, completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null),
  ]);

  const completedModules = progress ?? [];
  const completedAttempts = attempts ?? [];
  const fullAttempts = completedAttempts.filter((a) => a.mode === "full");

  const modulesCompleted = completedModules.length;
  const simuladosCompleted = fullAttempts.length;
  const passing = fullAttempts.filter((a) => Number(a.score) >= PASS_SCORE).length;
  const bestScore = completedAttempts.length
    ? Math.max(...completedAttempts.map((a) => Number(a.score) || 0))
    : null;

  const totalXp =
    modulesCompleted * XP_PER_MODULE +
    simuladosCompleted * XP_PER_FULL_SIMULADO +
    passing * XP_PASS_BONUS;

  const level = levelFor(totalXp);
  const xpIntoLevel = totalXp - level.minXp;
  const xpForNextLevel = level.nextXp !== null ? level.nextXp - level.minXp : null;
  const progressToNext =
    xpForNextLevel !== null ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;

  const activityDates = [
    ...completedModules.map((m) => m.last_visited_at).filter(Boolean),
    ...completedAttempts.map((a) => a.completed_at).filter(Boolean),
  ] as string[];
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
