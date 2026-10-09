// Score thresholds shared by the exam UI, XP, readiness and credentials.
// Client-safe: no server imports.

/** Nota de corte usada nos simulados completos (as provas oficiais pedem ~70-72%). */
export const PASS_SCORE = 72;

/** Prontidão: média dos 3 últimos simulados completos, com margem sobre o corte. */
export const READY_SCORE = 75;
