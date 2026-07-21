import "server-only";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { getModules, type CertId } from "@/lib/content";
import { getProgressForCert } from "@/lib/progress";

export type DomainStat = { domain: string; correct: number; total: number; pct: number };

export type Readiness = {
  certId: CertId;
  modulesCompleted: number;
  modulesTotal: number;
  fullAttempts: number;
  recentScores: number[]; // últimos 3 simulados completos, mais recente primeiro
  scoreHistory: Array<{ score: number; completedAt: string }>; // cronológico (antigo → recente)
  avgRecentScore: number | null;
  weakestDomains: DomainStat[];
  ready: boolean;
  advice: string;
};

const READY_SCORE = 75; // margem sobre a nota de corte (~70-72%)

// Regra de prontidão: todos os módulos concluídos + média >= 75% nos
// últimos 3 simulados completos.
export async function getReadiness(certId: CertId): Promise<Readiness> {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const modules = getModules(certId);
  const progress = await getProgressForCert(certId);
  const modulesCompleted = modules.filter(
    (m) => progress[`${certId}/${m.slug}`] === "completed"
  ).length;

  const { data: attempts } = await supabase
    .from("simulado_attempts")
    .select("score, domain_breakdown, completed_at")
    .eq("user_id", userId)
    .eq("cert_id", certId)
    .eq("mode", "full")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10);

  const completedAttempts = attempts ?? [];
  const scoreHistory = [...completedAttempts]
    .reverse()
    .map((a) => ({
      score: Number(a.score),
      completedAt: a.completed_at as string,
    }))
    .filter((h) => !Number.isNaN(h.score));
  const recentScores = completedAttempts
    .slice(0, 3)
    .map((a) => Number(a.score))
    .filter((s) => !Number.isNaN(s));

  const avgRecentScore =
    recentScores.length > 0
      ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
      : null;

  // Agrega desempenho por domínio de todas as tentativas para achar pontos fracos.
  const domainAgg: Record<string, { correct: number; total: number }> = {};
  for (const attempt of completedAttempts) {
    const breakdown = attempt.domain_breakdown as Record<
      string,
      { correct: number; total: number }
    > | null;
    if (!breakdown) continue;
    for (const [domain, stat] of Object.entries(breakdown)) {
      const bucket = (domainAgg[domain] ??= { correct: 0, total: 0 });
      bucket.correct += stat.correct;
      bucket.total += stat.total;
    }
  }

  const weakestDomains = Object.entries(domainAgg)
    .map(([domain, { correct, total }]) => ({
      domain,
      correct,
      total,
      pct: total ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  const allModulesDone = modulesCompleted === modules.length && modules.length > 0;
  const scoreReady =
    recentScores.length >= 3 && avgRecentScore !== null && avgRecentScore >= READY_SCORE;
  const ready = allModulesDone && scoreReady;

  let advice: string;
  if (ready) {
    advice =
      "Você está pronto! Agende a prova para as próximas 1–2 semanas enquanto o conteúdo está fresco.";
  } else if (!allModulesDone) {
    advice = `Conclua os ${modules.length - modulesCompleted} módulos restantes antes de intensificar os simulados.`;
  } else if (recentScores.length < 3) {
    advice = `Faça mais ${3 - recentScores.length} simulado(s) completo(s) para medir sua prontidão com confiança.`;
  } else {
    advice = `Sua média recente é ${avgRecentScore}%. Pratique os domínios mais fracos abaixo até a média passar de ${READY_SCORE}%.`;
  }

  return {
    certId,
    modulesCompleted,
    modulesTotal: modules.length,
    fullAttempts: completedAttempts.length,
    recentScores,
    scoreHistory,
    avgRecentScore,
    weakestDomains,
    ready,
    advice,
  };
}
