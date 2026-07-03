import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getModules, isValidCert } from "@/lib/content";

type SubmittedAnswers = Record<string, string[]>; // questionId -> chosen choice ids
type QuestionTimings = Record<string, number>; // questionId -> seconds

const HINT_PENALTY = 0.5; // questão certa com dica vale meio ponto (estilo AWS Jam)
const WEAK_DOMAIN_THRESHOLD = 72; // abaixo disso o domínio entra nas recomendações

// POST { attemptId, answers, timeSpentSeconds, questionTimings, overtimeSeconds }
// Correção 100% server-side. Penalidade de dica vem do registro no banco
// (rota /api/simulado/hint), nunca do que o client alega.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { attemptId, answers, timeSpentSeconds, questionTimings, overtimeSeconds } =
    (await request.json()) as {
      attemptId: string;
      answers: SubmittedAnswers;
      timeSpentSeconds: number;
      questionTimings?: QuestionTimings;
      overtimeSeconds?: number;
    };

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("simulado_attempts")
    .select("id, user_id, cert_id, mode, domain, completed_at, hints_used")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }
  if (attempt.completed_at) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const questionIds = Object.keys(answers ?? {});
  if (!questionIds.length) {
    return NextResponse.json({ error: "Nenhuma resposta enviada" }, { status: 400 });
  }

  const { data: questions } = await admin
    .from("questions")
    .select("id, domain, prompt, choices, correct_choice_ids, explanation")
    .in("id", questionIds)
    .eq("cert_id", attempt.cert_id);

  if (!questions?.length) {
    return NextResponse.json({ error: "Questões não encontradas" }, { status: 400 });
  }

  const hintsUsed: string[] = Array.isArray(attempt.hints_used)
    ? attempt.hints_used
    : [];
  const timings: QuestionTimings = questionTimings ?? {};

  const domainBreakdown: Record<string, { correct: number; total: number }> = {};
  const review: Array<{
    questionId: string;
    prompt: string;
    domain: string;
    choices: unknown;
    yourChoiceIds: string[];
    correctChoiceIds: string[];
    explanation: string | null;
    correct: boolean;
    hintUsed: boolean;
    timeSeconds: number | null;
  }> = [];

  let correctCount = 0;
  let points = 0;

  for (const q of questions) {
    const chosen = [...(answers[q.id] ?? [])].sort();
    const correct = [...q.correct_choice_ids].sort();
    const isCorrect =
      chosen.length === correct.length && chosen.every((c, i) => c === correct[i]);
    const usedHint = hintsUsed.includes(q.id);

    if (isCorrect) {
      correctCount++;
      points += usedHint ? HINT_PENALTY : 1;
    }

    const bucket = (domainBreakdown[q.domain] ??= { correct: 0, total: 0 });
    bucket.total++;
    if (isCorrect) bucket.correct++;

    review.push({
      questionId: q.id,
      prompt: q.prompt,
      domain: q.domain,
      choices: q.choices,
      yourChoiceIds: answers[q.id] ?? [],
      correctChoiceIds: q.correct_choice_ids,
      explanation: q.explanation,
      correct: isCorrect,
      hintUsed: usedHint,
      timeSeconds: typeof timings[q.id] === "number" ? Math.round(timings[q.id]) : null,
    });
  }

  const total = questions.length;
  const score = Math.round((points / total) * 100);
  const scoreNoPenalty = Math.round((correctCount / total) * 100);
  const overtime = Math.max(0, Math.round(overtimeSeconds ?? 0));

  // Onde o aluno mais demorou (top 5, só questões com tempo registrado)
  const slowest = review
    .filter((r) => r.timeSeconds !== null)
    .sort((a, b) => (b.timeSeconds ?? 0) - (a.timeSeconds ?? 0))
    .slice(0, 5)
    .map((r) => ({
      prompt: r.prompt,
      domain: r.domain,
      timeSeconds: r.timeSeconds as number,
      correct: r.correct,
      hintUsed: r.hintUsed,
    }));

  // Recomendações de estudo: domínios fracos -> módulos de teoria correspondentes
  const recommendations: Array<{
    domain: string;
    pct: number;
    modules: Array<{ slug: string; title: string }>;
  }> = [];

  if (isValidCert(attempt.cert_id)) {
    const allModules = getModules(attempt.cert_id);
    for (const [domain, { correct, total: t }] of Object.entries(domainBreakdown)) {
      const pct = Math.round((correct / t) * 100);
      if (pct < WEAK_DOMAIN_THRESHOLD) {
        const modules = allModules
          .filter((m) => m.domain === domain && m.type !== "lab")
          .slice(0, 4)
          .map((m) => ({ slug: m.slug, title: m.title }));
        if (modules.length) recommendations.push({ domain, pct, modules });
      }
    }
    recommendations.sort((a, b) => a.pct - b.pct);
  }

  await admin
    .from("simulado_attempts")
    .update({
      score,
      score_no_penalty: scoreNoPenalty,
      time_spent_seconds: timeSpentSeconds ?? null,
      question_timings: timings,
      overtime_seconds: overtime,
      answers,
      domain_breakdown: domainBreakdown,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  return NextResponse.json({
    score,
    scoreNoPenalty,
    hintsUsedCount: hintsUsed.filter((id) => questionIds.includes(id)).length,
    overtimeSeconds: overtime,
    correctCount,
    total,
    domainBreakdown,
    slowest,
    recommendations,
    review,
  });
}
