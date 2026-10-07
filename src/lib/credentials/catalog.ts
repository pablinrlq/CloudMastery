// Achievement catalog: what can be earned, how its medal looks and the rule
// that grants it. Pure — evaluated from aggregated study stats — so issuance on
// the server, the Conquistas page and the tests all run the same rules.
// Relative .ts imports keep it runnable by `node --test` (no path aliases there).
import { CERT_META, CERT_ORDER, type CertKey } from "../learning/cert-meta.ts";
import { CERTIFICATIONS } from "../learning/certifications.ts";
import { LEVELS } from "../learning/levels.ts";
import { PASS_SCORE, READY_SCORE } from "../learning/thresholds.ts";

export type CredentialKind = "badge" | "certificate";
export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";
export type BadgeTone = CertKey | "habit" | "level" | "diagnostic";
export type BadgeGlyph = "cloud" | "architecture" | "neural" | "flag" | "check" | "flame" | "target" | "cards" | "bolt" | "compass";
export type AchievementGroup = "certificados" | "trilhas" | "habitos" | "niveis" | "diagnostico";

export type BadgeArt = {
  tier: BadgeTier;
  tone: BadgeTone;
  glyph: BadgeGlyph;
  /** Big text on the medal face (cert code, a number, a level code). */
  label: string;
  /** Text on the ribbon. */
  caption: string;
};

export type Achievement = {
  /** Stable id stored with the credential, e.g. "track-complete:ccp". */
  key: string;
  kind: CredentialKind;
  group: AchievementGroup;
  certId: CertKey | null;
  title: string;
  description: string;
  criteria: string;
  skills: string[];
  art: BadgeArt;
};

export type Evidence = Record<string, number | string>;

export type AchievementStatus = Achievement & {
  earned: boolean;
  /** 0..1 */
  progress: number;
  progressLabel: string;
  /** Snapshot stored at issuance and shown on the public page. */
  evidence: Evidence;
  /** Hidden achievements stay out of the Conquistas page until earned. */
  visible: boolean;
};

export type CertStats = {
  modulesCompleted: number;
  modulesTotal: number;
  /** Completed full-exam scores, most recent first. */
  fullScores: number[];
};

export type StudyStats = {
  premium: boolean;
  certs: Record<CertKey, CertStats>;
  totalXp: number;
  longestStreak: number;
  fullSimulados: number;
  flashcardsKnown: number;
  diagnostic: { certId: CertKey; score: number } | null;
};

export const GROUP_LABELS: Record<AchievementGroup, string> = {
  certificados: "Certificados",
  trilhas: "Trilhas",
  habitos: "Hábitos de estudo",
  niveis: "Níveis",
  diagnostico: "Diagnóstico",
};

const CERT_GLYPH: Record<CertKey, BadgeGlyph> = { ccp: "cloud", saa: "architecture", aif: "neural" };

const LEVEL_TIERS: BadgeTier[] = ["bronze", "bronze", "bronze", "silver", "gold", "platinum", "platinum"];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

function certAchievements(certId: CertKey, stats: StudyStats): AchievementStatus[] {
  const meta = CERT_META[certId];
  const info = CERTIFICATIONS[certId];
  const own = stats.certs[certId];
  const total = own.modulesTotal;
  const done = Math.min(own.modulesCompleted, total);
  const best = own.fullScores.length ? Math.max(...own.fullScores) : null;
  const recent = own.fullScores.slice(0, 3);
  const recentAvg = average(recent);
  const trackDone = total > 0 && done >= total;
  const track = `${meta.short} (${meta.code})`;
  const skills = [...info.domains];
  const ready = trackDone && recent.length >= 3 && recentAvg !== null && recentAvg >= READY_SCORE;

  return [
    {
      key: `ready:${certId}`,
      kind: "certificate",
      group: "certificados",
      certId,
      title: `Certificado de prontidão · ${track}`,
      description: `Concluiu a trilha preparatória ${meta.code} (${total} módulos) e manteve média de ${READY_SCORE}% ou mais nos 3 últimos simulados completos.`,
      criteria: `Concluir a trilha e ter média de ${READY_SCORE}% ou mais nos 3 últimos simulados completos.`,
      skills,
      art: { tier: "platinum", tone: certId, glyph: CERT_GLYPH[certId], label: meta.code, caption: "Prontidão" },
      earned: ready,
      progress: ready
        ? 1
        : clamp01(
            ((total ? done / total : 0) +
              Math.min(3, recent.length) / 3 +
              (recentAvg === null ? 0 : Math.min(1, recentAvg / READY_SCORE))) /
              3
          ),
      progressLabel: `${done}/${total} módulos · ${Math.min(3, recent.length)}/3 simulados · média ${recentAvg === null ? "—" : `${recentAvg}%`}`,
      evidence: { modulesCompleted: done, modulesTotal: total, recentAverage: recentAvg ?? 0, bestScore: best ?? 0 },
      visible: true,
    },
    {
      key: `track-start:${certId}`,
      kind: "badge",
      group: "trilhas",
      certId,
      title: `Primeira missão · ${track}`,
      description: `Concluiu o primeiro módulo da trilha preparatória ${meta.code}.`,
      criteria: "Concluir o primeiro módulo da trilha.",
      skills,
      art: { tier: "bronze", tone: certId, glyph: "flag", label: meta.code, caption: "Primeira missão" },
      earned: done >= 1,
      progress: done >= 1 ? 1 : 0,
      progressLabel: done >= 1 ? `${done} ${done === 1 ? "módulo concluído" : "módulos concluídos"}` : "Nenhum módulo concluído",
      evidence: { modulesCompleted: done, modulesTotal: total },
      visible: true,
    },
    {
      key: `track-complete:${certId}`,
      kind: "badge",
      group: "trilhas",
      certId,
      title: `Trilha concluída · ${track}`,
      description: `Concluiu todos os ${total} módulos da trilha preparatória ${meta.code}.`,
      criteria: `Concluir os ${total} módulos da trilha.`,
      skills,
      art: { tier: "gold", tone: certId, glyph: CERT_GLYPH[certId], label: meta.code, caption: "Trilha concluída" },
      earned: trackDone,
      progress: total ? clamp01(done / total) : 0,
      progressLabel: `${done} de ${total} módulos`,
      evidence: { modulesCompleted: done, modulesTotal: total },
      visible: true,
    },
    {
      key: `exam-pass:${certId}`,
      kind: "badge",
      group: "trilhas",
      certId,
      title: `Aprovado no simulado · ${track}`,
      description: `Atingiu ${PASS_SCORE}% ou mais em um simulado completo de ${info.examQuestionCount} questões no formato da prova ${meta.code}.`,
      criteria: `Tirar ${PASS_SCORE}% ou mais em um simulado completo.`,
      skills,
      art: { tier: "gold", tone: certId, glyph: "check", label: meta.code, caption: "Aprovado" },
      earned: best !== null && best >= PASS_SCORE,
      progress: best === null ? 0 : clamp01(best / PASS_SCORE),
      progressLabel: best === null ? "Nenhum simulado completo" : `Melhor nota: ${best}%`,
      evidence: { bestScore: best ?? 0, examQuestions: info.examQuestionCount },
      visible: true,
    },
  ];
}

type CountRule = {
  key: string;
  title: string;
  description: string;
  criteria: string;
  unit: string;
  target: number;
  value: number;
  art: BadgeArt;
};

function countAchievement(rule: CountRule): AchievementStatus {
  const value = Math.max(0, rule.value);
  return {
    key: rule.key,
    kind: "badge",
    group: "habitos",
    certId: null,
    title: rule.title,
    description: rule.description,
    criteria: rule.criteria,
    skills: [],
    art: rule.art,
    earned: value >= rule.target,
    progress: clamp01(value / rule.target),
    progressLabel: `${Math.min(value, rule.target)} de ${rule.target} ${rule.unit}`,
    evidence: { value: Math.min(value, rule.target), target: rule.target },
    visible: true,
  };
}

function habitAchievements(stats: StudyStats): AchievementStatus[] {
  return [
    countAchievement({
      key: "streak-7",
      title: "Sequência de 7 dias",
      description: "Estudou 7 dias seguidos na CloudMastery.",
      criteria: "Estudar 7 dias seguidos.",
      unit: "dias seguidos",
      target: 7,
      value: stats.longestStreak,
      art: { tier: "silver", tone: "habit", glyph: "flame", label: "7", caption: "Dias seguidos" },
    }),
    countAchievement({
      key: "streak-30",
      title: "Sequência de 30 dias",
      description: "Estudou 30 dias seguidos na CloudMastery.",
      criteria: "Estudar 30 dias seguidos.",
      unit: "dias seguidos",
      target: 30,
      value: stats.longestStreak,
      art: { tier: "gold", tone: "habit", glyph: "flame", label: "30", caption: "Dias seguidos" },
    }),
    countAchievement({
      key: "simulados-10",
      title: "Maratonista de simulados",
      description: "Completou 10 simulados completos no formato da prova oficial.",
      criteria: "Completar 10 simulados completos.",
      unit: "simulados",
      target: 10,
      value: stats.fullSimulados,
      art: { tier: "silver", tone: "habit", glyph: "target", label: "10", caption: "Simulados" },
    }),
    countAchievement({
      key: "flashcards-50",
      title: "Memória de nuvem",
      description: "Dominou 50 flashcards de revisão.",
      criteria: "Marcar 50 flashcards como dominados.",
      unit: "flashcards",
      target: 50,
      value: stats.flashcardsKnown,
      art: { tier: "silver", tone: "habit", glyph: "cards", label: "50", caption: "Flashcards" },
    }),
  ];
}

function levelAchievements(stats: StudyStats): AchievementStatus[] {
  return LEVELS.map((level, index) => ({ level, index }))
    .filter(({ index }) => index >= 2)
    .map(({ level, index }) => {
      const xp = Math.max(0, stats.totalXp);
      return {
        key: `level-${index + 1}`,
        kind: "badge" as const,
        group: "niveis" as const,
        certId: null,
        title: `Nível ${level.name}`,
        description: `Alcançou o nível ${level.name} (${level.minXp.toLocaleString("pt-BR")} XP) estudando na CloudMastery.`,
        criteria: `Acumular ${level.minXp.toLocaleString("pt-BR")} XP.`,
        skills: [],
        art: { tier: LEVEL_TIERS[index], tone: "level" as const, glyph: "bolt" as const, label: level.code, caption: level.name },
        earned: xp >= level.minXp,
        progress: clamp01(xp / level.minXp),
        progressLabel: `${Math.min(xp, level.minXp).toLocaleString("pt-BR")} de ${level.minXp.toLocaleString("pt-BR")} XP`,
        evidence: { xp: Math.min(xp, level.minXp), target: level.minXp },
        visible: true,
      };
    });
}

function diagnosticAchievement(stats: StudyStats): AchievementStatus {
  const result = stats.diagnostic;
  const code = result ? CERT_META[result.certId].code : null;
  return {
    key: "diagnostic",
    kind: "badge",
    group: "diagnostico",
    certId: result?.certId ?? null,
    title: code ? `Diagnóstico de nível · ${code}` : "Diagnóstico de nível",
    description: code
      ? `Mediu o próprio nível com o diagnóstico de 30 questões da trilha ${code}.`
      : "Mede seu nível atual com um diagnóstico de 30 questões.",
    criteria: "Concluir o diagnóstico gratuito de 30 questões.",
    skills: result ? [...CERTIFICATIONS[result.certId].domains] : [],
    art: { tier: "bronze", tone: "diagnostic", glyph: "compass", label: code ?? "30 Q", caption: "Diagnóstico" },
    earned: result !== null,
    progress: result ? 1 : 0,
    progressLabel: result ? `Nota: ${result.score}%` : "Ainda não realizado",
    evidence: result ? { score: result.score } : {},
    // Premium accounts study with full exams; only show it once earned.
    visible: result !== null || !stats.premium,
  };
}

/** Every achievement with its current status, in display order. */
export function evaluateAchievements(stats: StudyStats): AchievementStatus[] {
  const perCert = CERT_ORDER.map((certId) => certAchievements(certId, stats));
  return [
    ...perCert.map((items) => items[0]),
    ...perCert.flatMap((items) => items.slice(1)),
    ...habitAchievements(stats),
    ...levelAchievements(stats),
    diagnosticAchievement(stats),
  ];
}

export function emptyStats(overrides: Partial<StudyStats> = {}): StudyStats {
  const certs = {} as Record<CertKey, CertStats>;
  for (const certId of CERT_ORDER) certs[certId] = { modulesCompleted: 0, modulesTotal: 0, fullScores: [] };
  return {
    premium: false,
    certs,
    totalXp: 0,
    longestStreak: 0,
    fullSimulados: 0,
    flashcardsKnown: 0,
    diagnostic: null,
    ...overrides,
  };
}

/**
 * Static description of an issued credential (title, art, criteria) from its
 * stored key. Certificates and track badges need the cert's module count for
 * their wording, so callers pass it when they have it.
 */
export function describeAchievement(
  key: string,
  { certId = null, modulesTotal = 0 }: { certId?: string | null; modulesTotal?: number } = {}
): Achievement | null {
  const cert = certId && certId in CERT_META ? (certId as CertKey) : null;
  const stats = emptyStats({
    diagnostic: key === "diagnostic" && cert ? { certId: cert, score: 0 } : null,
  });
  if (cert) stats.certs[cert] = { modulesCompleted: 0, modulesTotal, fullScores: [] };
  const found = evaluateAchievements(stats).find((item) => item.key === key);
  if (!found) return null;
  const { key: k, kind, group, certId: c, title, description, criteria, skills, art } = found;
  return { key: k, kind, group, certId: c, title, description, criteria, skills, art };
}

/** Human-readable proof lines for a credential's stored evidence. */
export function describeEvidence(key: string, evidence: Evidence): string[] {
  const n = (field: string) => Number(evidence[field]);
  const lines: string[] = [];
  if (key.startsWith("ready:")) {
    lines.push(`${n("modulesCompleted")} de ${n("modulesTotal")} módulos da trilha concluídos`);
    lines.push(`Média de ${n("recentAverage")}% nos 3 últimos simulados completos`);
    if (n("bestScore") > 0) lines.push(`Melhor nota em simulado completo: ${n("bestScore")}%`);
  } else if (key.startsWith("track-start:") || key.startsWith("track-complete:")) {
    lines.push(`${n("modulesCompleted")} de ${n("modulesTotal")} módulos concluídos na emissão`);
  } else if (key.startsWith("exam-pass:")) {
    lines.push(`Nota de ${n("bestScore")}% em simulado completo de ${n("examQuestions")} questões`);
  } else if (key.startsWith("streak-")) {
    lines.push(`${n("value")} dias seguidos de estudo`);
  } else if (key === "simulados-10") {
    lines.push(`${n("value")} simulados completos no formato oficial`);
  } else if (key === "flashcards-50") {
    lines.push(`${n("value")} flashcards dominados`);
  } else if (key.startsWith("level-")) {
    lines.push(`${n("target").toLocaleString("pt-BR")} XP acumulados`);
  } else if (key === "diagnostic") {
    // The score stays private: the badge proves the step, not the result.
    lines.push("Diagnóstico de 30 questões concluído");
  }
  return lines.filter((line) => !line.includes("NaN"));
}
