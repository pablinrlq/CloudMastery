import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";

// XP é DERIVADO dos dados existentes (progresso + simulados), sem tabela nova:
// evita dupla contagem e mantém o número sempre consistente com o histórico.
const XP_PER_MODULE = 50;
const XP_PER_FULL_SIMULADO = 100;
const XP_PASS_BONUS = 50; // simulado completo com nota >= corte
const PASS_SCORE = 72;

export type Level = {
  index: number;
  name: string;
  emoji: string;
  minXp: number;
  nextXp: number | null; // null = nível máximo
};

const LEVELS: Array<Omit<Level, "index" | "nextXp">> = [
  { name: "Cloud Rookie", emoji: "🌱", minXp: 0 },
  { name: "Cloud Explorer", emoji: "🧭", minXp: 200 },
  { name: "Cloud Builder", emoji: "🔧", minXp: 500 },
  { name: "Cloud Practitioner", emoji: "☁️", minXp: 1000 },
  { name: "Cloud Architect", emoji: "🏛️", minXp: 1800 },
  { name: "Cloud Expert", emoji: "⚡", minXp: 3000 },
  { name: "Cloud Master", emoji: "👑", minXp: 4500 },
];

export type GamificationProfile = {
  totalXp: number;
  level: Level;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressToNext: number; // 0-100
  streakDays: number;
  studiedToday: boolean;
  modulesCompleted: number;
  simuladosCompleted: number;
  bestScore: number | null;
};

function levelFor(xp: number): Level {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) {
    if (xp >= LEVELS[k].minXp) i = k;
  }
  const base = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  return { index: i, name: base.name, emoji: base.emoji, minXp: base.minXp, nextXp: next?.minXp ?? null };
}

// Streak = dias consecutivos com atividade, terminando hoje ou ontem.
function computeStreak(dates: string[]): { streak: number; today: boolean } {
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  if (days.size === 0) return { streak: 0, today: false };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const studiedToday = days.has(todayStr);

  // Âncora: se estudou hoje começa em hoje, senão em ontem (mantém o streak vivo por 1 dia de folga)
  let cursor = studiedToday ? todayStr : days.has(yStr) ? yStr : null;
  if (!cursor) return { streak: 0, today: false };

  let streak = 0;
  const d = new Date(cursor + "T00:00:00Z");
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return { streak, today: studiedToday };
}

export async function getGamificationProfile(): Promise<GamificationProfile> {
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
    xpIntoLevel,
    xpForNextLevel,
    progressToNext,
    streakDays: streak,
    studiedToday: today,
    modulesCompleted,
    simuladosCompleted,
    bestScore,
  };
}
