import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getModules, isValidCert } from "@/lib/content";
import { hasVerifiedEmail } from "@/lib/auth-security";
import { hasAccess, type Subscription } from "@/lib/dal";
import { enforceRateLimit } from "@/lib/rate-limit";

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
  if (!hasVerifiedEmail(user)) {
    return NextResponse.json(
      { error: "Confirme seu email para acessar o simulado." },
      { status: 403 }
    );
  }

  const rateLimited = await enforceRateLimit("simulado-submit", user.id, 30, 600);
  if (rateLimited) return rateLimited;

  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { attemptId, answers, timeSpentSeconds, questionTimings, overtimeSeconds } =
    payload as {
      attemptId: string;
      answers: SubmittedAnswers;
      timeSpentSeconds: number;
      questionTimings?: QuestionTimings;
      overtimeSeconds?: number;
    };

  if (
    typeof attemptId !== "string" ||
    !answers ||
    typeof answers !== "object" ||
    Array.isArray(answers) ||
    (questionTimings !== undefined &&
      (!questionTimings || typeof questionTimings !== "object" || Array.isArray(questionTimings)))
  ) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: attempt } = await admin
    .from("simulado_attempts")
    .select("id, user_id, cert_id, mode, domain, completed_at, hints_used, selected_question_ids")
    .eq("id", attemptId)
    .maybeSingle();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }
  if (attempt.completed_at) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("status, plan, cert_access, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  if (subscriptionError) {
    return NextResponse.json({ error: "Falha ao verificar acesso" }, { status: 503 });
  }
  const premiumInsights = hasAccess(
    subscription as Subscription | null,
    attempt.cert_id
  );
  if (attempt.mode !== "diagnostic" && !premiumInsights) {
    return NextResponse.json({ error: "Assinatura necessária" }, { status: 403 });
  }

  const questionIds: string[] = Array.isArray(attempt.selected_question_ids)
    ? attempt.selected_question_ids
    : [];
  if (!questionIds.length) {
    return NextResponse.json({ error: "Tentativa sem questões registradas" }, { status: 409 });
  }
  if (Object.keys(answers).some((id) => !questionIds.includes(id))) {
    return NextResponse.json({ error: "Resposta não pertence à tentativa" }, { status: 400 });
  }

  const { data: questions } = await admin
    .from("questions")
    .select("id, domain, prompt, choices, correct_choice_ids, explanation")
    .in("id", questionIds)
    .eq("cert_id", attempt.cert_id);

  if (!questions || questions.length !== questionIds.length) {
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
    const rawChosen = answers[q.id] ?? [];
    if (!Array.isArray(rawChosen) || rawChosen.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "Resposta inválida" }, { status: 400 });
    }
    const validChoiceIds = new Set(
      Array.isArray(q.choices)
        ? (q.choices as Array<{ id?: unknown }>).map((choice) => choice.id)
        : []
    );
    if (rawChosen.some((id) => !validChoiceIds.has(id))) {
      return NextResponse.json({ error: "Alternativa inválida" }, { status: 400 });
    }
    const chosen = [...new Set(rawChosen)].sort();
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
      yourChoiceIds: chosen,
      correctChoiceIds: q.correct_choice_ids,
      explanation: q.explanation,
      correct: isCorrect,
      hintUsed: usedHint,
      timeSeconds:
        typeof timings[q.id] === "number" && Number.isFinite(timings[q.id])
          ? Math.min(86_400, Math.max(0, Math.round(timings[q.id])))
          : null,
    });
  }

  const total = questions.length;
  const score = Math.round((points / total) * 100);
  const scoreNoPenalty = Math.round((correctCount / total) * 100);
  const overtime =
    typeof overtimeSeconds === "number" && Number.isFinite(overtimeSeconds)
      ? Math.min(86_400, Math.max(0, Math.round(overtimeSeconds)))
      : 0;
  const totalTime =
    typeof timeSpentSeconds === "number" && Number.isFinite(timeSpentSeconds)
      ? Math.min(86_400, Math.max(0, Math.round(timeSpentSeconds)))
      : null;

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

  const { data: completed, error: updateError } = await admin
    .from("simulado_attempts")
    .update({
      score,
      score_no_penalty: scoreNoPenalty,
      time_spent_seconds: totalTime,
      question_timings: timings,
      overtime_seconds: overtime,
      answers,
      domain_breakdown: domainBreakdown,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .is("completed_at", null)
    .select("id")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: "Falha ao salvar resultado" }, { status: 500 });
  }
  if (!completed) {
    return NextResponse.json({ error: "Tentativa já finalizada" }, { status: 409 });
  }

  const baseResult = {
    score,
    scoreNoPenalty,
    hintsUsedCount: hintsUsed.filter((id) => questionIds.includes(id)).length,
    overtimeSeconds: overtime,
    correctCount,
    total,
    premiumInsights,
  };

  if (!premiumInsights) {
    return NextResponse.json({
      ...baseResult,
      upgradeUrl: `/pricing?from=diagnostic&cert=${attempt.cert_id}`,
    });
  }

  return NextResponse.json({
    ...baseResult,
    domainBreakdown,
    slowest,
    recommendations,
    review,
  });
}
