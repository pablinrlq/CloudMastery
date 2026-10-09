// XP and level rules. Pure (no server imports) so credentials and tests reuse
// exactly the numbers the workspace shows.
import { PASS_SCORE } from "./thresholds.ts";

export const XP_PER_MODULE = 50;
export const XP_PER_FULL_SIMULADO = 100;
export const XP_PASS_BONUS = 50; // simulado completo com nota >= corte

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

// XP is derived from existing data (progress + completed full exams), never stored.
export function computeXp({
  modulesCompleted,
  fullScores,
}: {
  modulesCompleted: number;
  fullScores: number[];
}): number {
  const passing = fullScores.filter((score) => score >= PASS_SCORE).length;
  return modulesCompleted * XP_PER_MODULE + fullScores.length * XP_PER_FULL_SIMULADO + passing * XP_PASS_BONUS;
}

export function levelFor(xp: number): Level {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) {
    if (xp >= LEVELS[k].minXp) i = k;
  }
  const base = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  return { index: i, name: base.name, code: base.code, minXp: base.minXp, nextXp: next?.minXp ?? null };
}
